import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer'

export interface ReceiptItem {
  name: string
  quantity: number
  price?: number
  notes?: string
}

export interface ReceiptData {
  orderNumber: number | string
  orderId: string
  teamName: string
  eventName: string
  clientName?: string
  orderNotes?: string
  items: ReceiptItem[]
  total?: number
  locationName?: string
  printMode: 'kitchen' | 'receipt'
  showPrices: boolean
  createdAt: Date | string
  isPersonnel?: boolean
}

export interface FormattedReceipt {
  base64: string
  rawBuffer: Buffer
}

/**
 * Generate ESC/POS formatted receipt data for thermal printers
 * Returns both Base64 encoded string and raw buffer
 */
export function formatReceipt(data: ReceiptData): FormattedReceipt {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://dummy', // Dummy interface for buffer generation only
    width: 48,
    removeSpecialCharacters: false
  })

  try {
    // Header with team and event
    printer.alignCenter()
    printer.bold(true)
    printer.println(data.teamName)
    printer.bold(false)
    printer.println(data.eventName)

    // Location header for kitchen tickets
    if (data.printMode === 'kitchen' && data.locationName) {
      printer.drawLine()
      printer.bold(true)
      printer.println(data.locationName.toUpperCase())
      printer.bold(false)
    }

    printer.drawLine()

    // Order information
    printer.alignLeft()
    printer.bold(true)
    printer.println(`Order #${data.orderNumber}`)
    printer.bold(false)

    const orderDate = typeof data.createdAt === 'string'
      ? new Date(data.createdAt)
      : data.createdAt
    printer.println(`Time: ${orderDate.toLocaleString()}`)

    if (data.clientName) {
      printer.println(`Client: ${data.clientName}`)
    }

    // Staff order indicator
    if (data.isPersonnel) {
      printer.println('')
      printer.alignCenter()
      printer.bold(true)
      printer.invert(true)
      printer.println('*** STAFF ORDER ***')
      printer.invert(false)
      printer.bold(false)
      printer.alignLeft()
    }

    // Special instructions at the top for kitchen
    if (data.orderNotes && data.printMode === 'kitchen') {
      printer.drawLine()
      printer.bold(true)
      printer.println('SPECIAL INSTRUCTIONS:')
      printer.bold(false)
      printer.println(data.orderNotes)
    }

    printer.drawLine()

    // Items section
    if (data.items && data.items.length > 0) {
      const isKitchenTicket = data.printMode === 'kitchen'

      for (const item of data.items) {
        if (isKitchenTicket) {
          // Kitchen format - bold text, no prices
          printer.bold(true)
          printer.println(`${item.quantity}x ${item.name}`)
          printer.bold(false)
        } else if (data.showPrices && item.price !== undefined) {
          // Receipt format with prices
          printer.bold(true)
          const itemTotal = item.price * item.quantity
          const itemText = `${item.quantity}x ${item.name}`
          const priceText = `€${itemTotal.toFixed(2)}`
          const padding = 48 - itemText.length - priceText.length
          printer.println(itemText + ' '.repeat(Math.max(1, padding)) + priceText)
          printer.bold(false)
        } else {
          // Receipt format without prices
          printer.bold(true)
          printer.println(`${item.quantity}x ${item.name}`)
          printer.bold(false)
        }

        // Item notes/modifications
        if (item.notes) {
          printer.println(`  → ${item.notes}`)
        }

        printer.println('')
      }
    }

    // Special instructions at bottom for receipts
    if (data.orderNotes && data.printMode === 'receipt') {
      printer.drawLine()
      printer.bold(true)
      printer.println('NOTES:')
      printer.bold(false)
      printer.println(data.orderNotes)
    }

    // Total for receipts with prices
    if (data.printMode === 'receipt' && data.showPrices && data.total !== undefined) {
      printer.drawLine()
      printer.alignLeft()

      const totalLabel = 'TOTAL:'
      const totalAmount = `€${data.total.toFixed(2)}`
      const totalPadding = 48 - totalLabel.length - totalAmount.length

      printer.bold(true)
      printer.println(totalLabel + ' '.repeat(Math.max(1, totalPadding)) + totalAmount)
      printer.bold(false)
    }

    // Footer
    printer.drawLine()

    if (data.printMode === 'receipt') {
      printer.alignCenter()
      printer.println('Thank You!')
    }

    // Extra spacing and cut
    printer.println('')
    printer.println('')
    printer.cut()

    // Get the raw buffer
    let rawBuffer = printer.getBuffer()

    // Remove any ESC @ from the end if it exists
    if (rawBuffer[rawBuffer.length - 2] === 0x1B && rawBuffer[rawBuffer.length - 1] === 0x40) {
      rawBuffer = rawBuffer.slice(0, -2)
    }

    // Fix for TM-m30: Replace ESC d (feed) commands with line feeds
    const fixedBuffer: number[] = []
    for (let i = 0; i < rawBuffer.length; i++) {
      if (i < rawBuffer.length - 2 &&
          rawBuffer[i] === 0x1B &&
          rawBuffer[i+1] === 0x64) {
        // Found ESC d command, replace with line feeds
        const feedCount = rawBuffer[i+2]
        for (let j = 0; j < feedCount; j++) {
          fixedBuffer.push(0x0A) // Line feed
        }
        i += 2 // Skip the ESC d n sequence
      } else {
        fixedBuffer.push(rawBuffer[i])
      }
    }
    rawBuffer = Buffer.from(fixedBuffer)

    // Prepend ESC @ at the beginning
    rawBuffer = Buffer.concat([
      Buffer.from([0x1B, 0x40]), // ESC @ - Initialize printer FIRST
      rawBuffer
    ])

    // Convert to Base64
    const base64 = rawBuffer.toString('base64')

    return {
      base64,
      rawBuffer: Buffer.from(rawBuffer)
    }
  } catch (error: any) {
    console.error('Error formatting receipt:', error)
    throw new Error(`Failed to format receipt: ${error.message}`)
  }
}

/**
 * Generate a test receipt for printer testing
 */
export function formatTestReceipt(printerName: string, ipAddress: string): FormattedReceipt {
  const printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: 'tcp://dummy',
    width: 48,
    removeSpecialCharacters: false
  })

  printer.alignCenter()
  printer.bold(true)
  printer.println('PRINTER TEST')
  printer.bold(false)
  printer.drawLine()

  printer.alignLeft()
  printer.println(`Printer: ${printerName}`)
  printer.println(`IP: ${ipAddress}`)
  printer.println(`Time: ${new Date().toLocaleString()}`)
  printer.drawLine()

  printer.alignCenter()
  printer.println('Test successful!')
  printer.println('ESC/POS formatting active')
  printer.println('')
  printer.cut()

  // Get the raw buffer
  let rawBuffer = printer.getBuffer()

  // Remove any ESC @ from the end if it exists
  if (rawBuffer[rawBuffer.length - 2] === 0x1B && rawBuffer[rawBuffer.length - 1] === 0x40) {
    rawBuffer = rawBuffer.slice(0, -2)
  }

  // Fix for TM-m30: Replace ESC d (feed) commands with line feeds
  const fixedBuffer: number[] = []
  for (let i = 0; i < rawBuffer.length; i++) {
    if (i < rawBuffer.length - 2 &&
        rawBuffer[i] === 0x1B &&
        rawBuffer[i+1] === 0x64) {
      const feedCount = rawBuffer[i+2]
      for (let j = 0; j < feedCount; j++) {
        fixedBuffer.push(0x0A)
      }
      i += 2
    } else {
      fixedBuffer.push(rawBuffer[i])
    }
  }
  rawBuffer = Buffer.from(fixedBuffer)

  // Prepend ESC @ at the beginning
  rawBuffer = Buffer.concat([
    Buffer.from([0x1B, 0x40]),
    rawBuffer
  ])

  const base64 = rawBuffer.toString('base64')

  return {
    base64,
    rawBuffer: Buffer.from(rawBuffer)
  }
}
