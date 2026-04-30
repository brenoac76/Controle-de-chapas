import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Sheet, Transaction, Client, Supplier } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  LIST = 'list',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error('Firestore Error: ', error);
  throw new Error(`Firestore Error: ${String(error)} during ${operationType} on ${path}`);
}

export const useStockState = () => {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    const unsubSheets = onSnapshot(collection(db, 'sheets'), (snapshot) => {
      setSheets(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Sheet)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sheets'));
    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'transactions'));
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Client)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'clients'));
    const unsubSuppliers = onSnapshot(collection(db, 'suppliers'), (snapshot) => {
      setSuppliers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Supplier)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'suppliers'));

    return () => {
      unsubSheets();
      unsubTransactions();
      unsubClients();
      unsubSuppliers();
    };
  }, []);

  const addSheet = async (sheet: Sheet) => {
    try {
      await addDoc(collection(db, 'sheets'), sheet);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sheets');
    }
  };

  const addTransaction = async (transaction: Transaction) => {
    try {
      await addDoc(collection(db, 'transactions'), transaction);
      const sheetRef = doc(db, 'sheets', transaction.sheetId);
      const qtyChange = transaction.type === 'entry' ? transaction.quantity : -transaction.quantity;
      await updateDoc(sheetRef, {
        quantity: increment(qtyChange)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'transactions');
    }
  };

  const addClient = async (client: Client) => {
    try {
      await addDoc(collection(db, 'clients'), client);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'clients');
    }
  };

  const addSupplier = async (supplier: Supplier) => {
    try {
      await addDoc(collection(db, 'suppliers'), supplier);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'suppliers');
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      await updateDoc(doc(db, 'clients', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'clients');
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      await updateDoc(doc(db, 'suppliers', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'suppliers');
    }
  };

  const deleteDocument = async (collectionName: string, id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, collectionName);
    }
  };

  return { 
    sheets, transactions, clients, suppliers, 
    addSheet, addTransaction, addClient, addSupplier,
    updateClient, updateSupplier,
    deleteSheet: async (id: string) => {
      const relatedTransactions = transactions.filter(t => t.sheetId === id);
      if (relatedTransactions.length > 0) {
        throw new Error('Não é possível excluir: existem movimentações vinculadas a esta chapa.');
      }
      await deleteDocument('sheets', id);
    },
    deleteTransaction: async (id: string) => {
      const t = transactions.find(t => t.id === id);
      if (t) {
        if (t.type === 'entry') {
          const hasExits = transactions.some(other => 
            (other.type === 'exit' || other.type === 'partial_usage') && 
            other.sheetId === t.sheetId &&
            other.sourceClientId === t.destinationClientId &&
            (other.orderNumber === t.orderNumber || !t.orderNumber || !other.orderNumber)
          );
          if (hasExits) {
            throw new Error('Não é possível excluir: existem movimentações de saída vinculadas a esta entrada.');
          }
        }
        try {
          const sheetRef = doc(db, 'sheets', t.sheetId);
          const qtyChange = t.type === 'entry' ? -t.quantity : t.quantity;
          await updateDoc(sheetRef, { quantity: increment(qtyChange) });
        } catch (e) {
          // Ignore if sheet doesn't exist
        }
      }
      await deleteDocument('transactions', id);
    },
    deleteClient: async (id: string) => {
      const relatedTransactions = transactions.filter(t => t.sourceClientId === id || t.destinationClientId === id);
      if (relatedTransactions.length > 0) {
        throw new Error('Não é possível excluir: existem movimentações vinculadas a este cliente.');
      }
      await deleteDocument('clients', id);
    },
    deleteSupplier: async (id: string) => {
      const relatedTransactions = transactions.filter(t => t.supplierId === id);
      if (relatedTransactions.length > 0) {
        throw new Error('Não é possível excluir: existem movimentações vinculadas a este fornecedor.');
      }
      await deleteDocument('suppliers', id);
    }
  };
};
