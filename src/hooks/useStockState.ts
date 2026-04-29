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
    deleteSheet: async (id: string) => {
      await deleteDocument('sheets', id);
      const relatedTransactions = transactions.filter(t => t.sheetId === id);
      for (const t of relatedTransactions) {
        await deleteDocument('transactions', t.id);
      }
    },
    deleteTransaction: async (id: string) => {
      const t = transactions.find(t => t.id === id);
      if (t) {
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
    deleteClient: (id: string) => deleteDocument('clients', id),
    deleteSupplier: (id: string) => deleteDocument('suppliers', id)
  };
};
