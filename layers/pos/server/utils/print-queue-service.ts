import { eq, and, inArray } from 'drizzle-orm'
import { formatReceipt, type ReceiptItem } from './receipt-formatter'
import { posPrintqueues } from '~~/layers/pos/collections/printqueues/server/database/schema'
import { posPrinters } from '~~/layers/pos/collections/printers/server/database/schema'
import { posProducts } from '~~/layers/pos/collections/products/server/database/schema'
import { posOrderitems } from '~~/layers/pos/collections/orderitems/server/database/schema'
import { posLocations } from '~~/layers/pos/collections/locations/server/database/schema'

// Status codes for print queue
export const PRINT_STATUS = {
  PENDING: 0,
  PRINTING: 1,
  COMPLETED: 2,
  FAILED: 9
} as const

interface OrderItem {
  productId: string
  productTitle: string
  quantity: number
  unitPrice: number
  remarks?: string
  locationId?: string
  locationTitle?: string
}

interface GenerateQueuesOptions {
  orderId: string
  eventId: string
  teamId: string
  orderNumber: string
  clientName?: string
  orderNotes?: string
  teamName: string
  eventName: string
  isPersonnel?: boolean
  createdBy: string
}

/**
 * Generates print queue entries for an order based on location and printer configuration
 */
export async function generatePrintQueues(options: GenerateQueuesOptions): Promise<string[]> {
  const {
    orderId,
    eventId,
    teamId,
    orderNumber,
    clientName,
    orderNotes,
    teamName,
    eventName,
    isPersonnel = false,
    createdBy
  } = options

  const db = useDB()

  // Get order items with product and location info
  const orderItems = await db
    .select({
      productId: posOrderitems.productId,
      quantity: posOrderitems.quantity,
      unitPrice: posOrderitems.unitPrice,
      remarks: posOrderitems.remarks,
      productTitle: posProducts.title,
      productPrice: posProducts.price,
      locationId: posProducts.locationId,
      locationTitle: posLocations.title
    })
    .from(posOrderitems)
    .leftJoin(posProducts, eq(posOrderitems.productId, posProducts.id))
    .leftJoin(posLocations, eq(posProducts.locationId, posLocations.id))
    .where(eq(posOrderitems.orderId, orderId))

  if (orderItems.length === 0) {
    return []
  }

  // Group items by location
  const itemsByLocation = new Map<string, {
    items: OrderItem[]
    locationTitle: string
  }>()

  for (const item of orderItems) {
    const locationId = item.locationId || 'default'

    if (!itemsByLocation.has(locationId)) {
      itemsByLocation.set(locationId, {
        items: [],
        locationTitle: item.locationTitle || 'Default'
      })
    }

    itemsByLocation.get(locationId)!.items.push({
      productId: item.productId,
      productTitle: item.productTitle || 'Unknown',
      quantity: parseInt(item.quantity as string, 10) || 1,
      unitPrice: item.unitPrice,
      remarks: item.remarks || undefined,
      locationId: item.locationId || undefined,
      locationTitle: item.locationTitle || undefined
    })
  }

  const createdQueueIds: string[] = []

  // Get all active printers for this event
  const allPrinters = await db
    .select()
    .from(posPrinters)
    .where(
      and(
        eq(posPrinters.eventId, eventId),
        eq(posPrinters.isActive, true)
      )
    )
  console.log('[print-queue] Found', allPrinters.length, 'active printers for event', eventId)
  if (allPrinters.length === 0) {
    console.log('[print-queue] WARNING: No active printers configured for this event!')
  }

  // Separate kitchen printers (by location) and receipt printers
  const kitchenPrinters = allPrinters.filter(p => p.type === 'kitchen' || !p.type)
  const receiptPrinters = allPrinters.filter(p => p.type === 'receipt')

  // Create kitchen ticket queue entries (one per location per printer)
  for (const [locationId, locationData] of itemsByLocation) {
    const { items, locationTitle } = locationData

    // Find printers for this location
    const printersForLocation = kitchenPrinters.filter(p =>
      p.locationId === locationId || locationId === 'default'
    )

    for (const printer of printersForLocation) {
      const receiptItems: ReceiptItem[] = items.map(item => ({
        name: item.productTitle,
        quantity: item.quantity,
        price: printer.showPrices ? item.unitPrice : undefined,
        notes: item.remarks
      }))

      const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)

      const formattedReceipt = formatReceipt({
        orderNumber,
        orderId,
        teamName,
        eventName,
        clientName,
        orderNotes,
        items: receiptItems,
        total: printer.showPrices ? total : undefined,
        locationName: locationTitle,
        printMode: 'kitchen',
        showPrices: printer.showPrices || false,
        createdAt: new Date(),
        isPersonnel
      })

      const [queueEntry] = await db
        .insert(posPrintqueues)
        .values({
          teamId,
          owner: createdBy,
          eventId,
          orderId,
          printerId: printer.id,
          locationId: locationId === 'default' ? null : locationId,
          status: PRINT_STATUS.PENDING,
          printData: formattedReceipt.base64,
          printMode: 'kitchen',
          retryCount: 0,
          createdBy,
          updatedBy: createdBy
        })
        .returning()

      createdQueueIds.push(queueEntry.id)
    }
  }

  // Create receipt queue entry (one for all items)
  if (receiptPrinters.length > 0) {
    // Collect all items for the receipt
    const allItems: ReceiptItem[] = []
    for (const [, locationData] of itemsByLocation) {
      for (const item of locationData.items) {
        allItems.push({
          name: item.productTitle,
          quantity: item.quantity,
          price: item.unitPrice,
          notes: item.remarks
        })
      }
    }

    const total = allItems.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)

    // Use the first receipt printer (could be enhanced to support multiple)
    const receiptPrinter = receiptPrinters[0]

    const formattedReceipt = formatReceipt({
      orderNumber,
      orderId,
      teamName,
      eventName,
      clientName,
      orderNotes,
      items: allItems,
      total,
      locationName: undefined,
      printMode: 'receipt',
      showPrices: true,
      createdAt: new Date(),
      isPersonnel
    })

    const [queueEntry] = await db
      .insert(posPrintqueues)
      .values({
        teamId,
        owner: createdBy,
        eventId,
        orderId,
        printerId: receiptPrinter.id,
        locationId: null,
        status: PRINT_STATUS.PENDING,
        printData: formattedReceipt.base64,
        printMode: 'receipt',
        retryCount: 0,
        createdBy,
        updatedBy: createdBy
      })
      .returning()

    createdQueueIds.push(queueEntry.id)
  }

  return createdQueueIds
}

/**
 * Get pending print jobs for a specific event (for polling)
 */
export async function getPendingPrintJobs(eventId: string) {
  const db = useDB()

  const jobs = await db
    .select({
      id: posPrintqueues.id,
      orderId: posPrintqueues.orderId,
      printerId: posPrintqueues.printerId,
      locationId: posPrintqueues.locationId,
      status: posPrintqueues.status,
      printData: posPrintqueues.printData,
      printMode: posPrintqueues.printMode,
      retryCount: posPrintqueues.retryCount,
      createdAt: posPrintqueues.createdAt,
      printerIp: posPrinters.ipAddress,
      printerPort: posPrinters.port,
      printerTitle: posPrinters.title
    })
    .from(posPrintqueues)
    .leftJoin(posPrinters, eq(posPrintqueues.printerId, posPrinters.id))
    .where(
      and(
        eq(posPrintqueues.eventId, eventId),
        eq(posPrintqueues.status, PRINT_STATUS.PENDING)
      )
    )

  return jobs
}

/**
 * Mark a print job as printing (in progress)
 */
export async function markJobPrinting(jobId: string, updatedBy: string) {
  const db = useDB()

  const [job] = await db
    .update(posPrintqueues)
    .set({
      status: PRINT_STATUS.PRINTING,
      updatedBy
    })
    .where(eq(posPrintqueues.id, jobId))
    .returning()

  return job
}

/**
 * Mark a print job as completed
 */
export async function markJobCompleted(jobId: string, updatedBy: string) {
  const db = useDB()

  const [job] = await db
    .update(posPrintqueues)
    .set({
      status: PRINT_STATUS.COMPLETED,
      completedAt: new Date(),
      updatedBy
    })
    .where(eq(posPrintqueues.id, jobId))
    .returning()

  return job
}

/**
 * Mark a print job as failed
 */
export async function markJobFailed(jobId: string, errorMessage: string, updatedBy: string) {
  const db = useDB()

  const [job] = await db
    .update(posPrintqueues)
    .set({
      status: PRINT_STATUS.FAILED,
      errorMessage,
      updatedBy
    })
    .where(eq(posPrintqueues.id, jobId))
    .returning()

  return job
}

/**
 * Retry a failed print job
 */
export async function retryPrintJob(jobId: string, updatedBy: string) {
  const db = useDB()

  // Get the current job
  const [currentJob] = await db
    .select()
    .from(posPrintqueues)
    .where(eq(posPrintqueues.id, jobId))

  if (!currentJob) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Print job not found'
    })
  }

  // Reset status to pending and increment retry count
  const [job] = await db
    .update(posPrintqueues)
    .set({
      status: PRINT_STATUS.PENDING,
      errorMessage: null,
      retryCount: (currentJob.retryCount || 0) + 1,
      updatedBy
    })
    .where(eq(posPrintqueues.id, jobId))
    .returning()

  return job
}
