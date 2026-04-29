import { Sheet, Transaction } from '../types';

export const getClientBalancesByOrder = (sheet: Sheet, transactions: Transaction[]) => {
  const relevantTransactions = transactions.filter(t => t.sheetId === sheet.id);
  
  // order balances: clientId -> orderNumber -> quantity
  const balances: Record<string, Record<string, number>> = {};
  
  // Iterate entries first to establish order numbers
  relevantTransactions.filter(t => t.type === 'entry').forEach(t => {
      const clientId = t.destinationClientId;
      const orderNumber = t.orderNumber || 'S/N';
      if (clientId) {
          if (!balances[clientId]) balances[clientId] = {};
          balances[clientId][orderNumber] = (balances[clientId][orderNumber] || 0) + t.quantity;
      }
  });

  // Iterate exits and deduct from order numbers (FIFO matching or just first available)
  relevantTransactions.filter(t => t.type === 'exit' || t.type === 'partial_usage').forEach(t => {
      const clientId = t.sourceClientId;
      let qtyToDeduct = t.quantity;
      
      if (clientId && balances[clientId]) {
          // If transaction has a specific orderNumber, try to deduct from it
          if (t.orderNumber && balances[clientId][t.orderNumber]) {
              const available = balances[clientId][t.orderNumber];
              const deduct = Math.min(available, qtyToDeduct);
              balances[clientId][t.orderNumber] -= deduct;
              qtyToDeduct -= deduct;
          }
          
          // Deduct remaining from other orders if needed
          for (const orderNumber of Object.keys(balances[clientId])) {
              if (qtyToDeduct <= 0) break;
              const available = balances[clientId][orderNumber];
              if (available > 0) {
                  const deduct = Math.min(available, qtyToDeduct);
                  balances[clientId][orderNumber] -= deduct;
                  qtyToDeduct -= deduct;
              }
          }
      }
  });
  
  const currentBalances: Record<string, Record<string, number>> = {};
  Object.keys(balances).forEach(clientId => {
      Object.keys(balances[clientId]).forEach(orderNumber => {
          const qty = balances[clientId][orderNumber];
          if (!currentBalances[clientId]) currentBalances[clientId] = {};
          currentBalances[clientId][orderNumber] = qty;
      });
  });

  return currentBalances;
};

export const getClientBalances = (sheet: Sheet, transactions: Transaction[]) => {
  const byOrder = getClientBalancesByOrder(sheet, transactions);
  const currentBalances: Record<string, number> = {};
  
  Object.keys(byOrder).forEach(clientId => {
      let total = 0;
      Object.values(byOrder[clientId]).forEach(qty => {
          total += qty;
      });
      if (total > 0) {
          currentBalances[clientId] = total;
      }
  });
  
  return currentBalances;
};
