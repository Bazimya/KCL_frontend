import { createContext, useContext, useState, useEffect } from 'react'

const TableContext = createContext(null)
const STORAGE_KEY = 'kcl_scanned_table'

// Holds the table a customer scanned (via /t/:qrToken), so Checkout can
// auto-attach it to a dine-in order without asking them to pick it again -
// the scan itself IS the table selection. Cleared once an order is placed,
// or if the customer explicitly says "not my table".
export const TableProvider = ({ children }) => {
  const [scannedTable, setScannedTableState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (scannedTable) localStorage.setItem(STORAGE_KEY, JSON.stringify(scannedTable))
    else localStorage.removeItem(STORAGE_KEY)
  }, [scannedTable])

  const setScannedTable = (table) => {
    setScannedTableState(table)
    // A real scan just happened - clear any "Not now" snooze on the dine-in
    // prompt so a later "not your table?" correctly starts the cycle fresh.
    localStorage.removeItem('kcl_dinein_prompt_snooze_until')
  }
  const clearScannedTable = () => setScannedTableState(null)

  return (
    <TableContext.Provider value={{ scannedTable, setScannedTable, clearScannedTable }}>
      {children}
    </TableContext.Provider>
  )
}

export const useTable = () => useContext(TableContext)
export default TableContext
