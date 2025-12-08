import { z } from 'zod'

export const posEventSettingSchema = z.object({
  eventId: z.string().min(1, 'eventId is required'),
  settingKey: z.string().min(1, 'settingKey is required'),
  settingValue: z.string().optional(),
  description: z.string().optional()
})

export const posEventSettingsColumns = [
  { accessorKey: 'id', header: 'Id' },
  { accessorKey: 'eventId', header: 'EventId' },
  { accessorKey: 'settingKey', header: 'SettingKey' },
  { accessorKey: 'settingValue', header: 'SettingValue' },
  { accessorKey: 'description', header: 'Description' }
]

export const posEventSettingsConfig = {
  name: 'posEventSettings',
  layer: 'pos',
  apiPath: 'pos-eventsettings',
  componentName: 'PosEventSettingsForm',
  schema: posEventSettingSchema,
  defaultValues: {
    eventId: '',
    settingKey: '',
    settingValue: '',
    description: ''
  },
  columns: posEventSettingsColumns,
}

export const usePosEventSettings = () => posEventSettingsConfig

// Default export for auto-import compatibility
export default function () {
  return {
    defaultValue: posEventSettingsConfig.defaultValues,
    schema: posEventSettingsConfig.schema,
    columns: posEventSettingsConfig.columns,
    collection: posEventSettingsConfig.name
  }
}