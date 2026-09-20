import { AppraisalSubmission, ContactSubmission } from "./types";

interface Store {
  contacts: ContactSubmission[];
  appraisals: AppraisalSubmission[];
}

declare global {
  var __auraStore: Store | undefined;
}

const store: Store = globalThis.__auraStore ?? { contacts: [], appraisals: [] };
globalThis.__auraStore = store;

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addContact(data: Omit<ContactSubmission, "id" | "createdAt">) {
  const entry: ContactSubmission = {
    ...data,
    id: makeId(),
    createdAt: new Date().toISOString(),
  };
  store.contacts.unshift(entry);
  return entry;
}

export function addAppraisal(
  data: Omit<AppraisalSubmission, "id" | "createdAt">
) {
  const entry: AppraisalSubmission = {
    ...data,
    id: makeId(),
    createdAt: new Date().toISOString(),
  };
  store.appraisals.unshift(entry);
  return entry;
}

export function getContacts() {
  return store.contacts;
}

export function getAppraisals() {
  return store.appraisals;
}
