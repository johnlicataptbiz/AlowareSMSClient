import { Contact } from '../types';

/**
 * Service to handle local caching and indexing of contacts.
 * Addresses the Aloware "Listing Gap" by maintaining a client-side
 * search index for instant lookup without API latency.
 */
class ContactCacheService {
  private contacts: Map<string, Contact>;
  private searchIndex: Array<{ id: string; tokens: string }>;

  constructor() {
    this.contacts = new Map();
    this.searchIndex = [];
  }

  /**
   * Initialize or overwrite the cache with a list of contacts
   */
  initialize(contacts: Contact[]) {
    this.contacts.clear();
    this.searchIndex = [];
    this.bulkUpsert(contacts);
  }

  /**
   * Add or Update multiple contacts
   */
  bulkUpsert(contacts: Contact[]) {
    contacts.forEach(c => this.upsert(c));
  }

  /**
   * Add or Update a single contact and update the index
   */
  upsert(contact: Contact) {
    this.contacts.set(contact.id, contact);
    this.updateIndex(contact);
  }

  /**
   * Retrieve a contact by ID
   */
  get(id: string): Contact | undefined {
    return this.contacts.get(id);
  }

  /**
   * Get all cached contacts
   */
  getAll(): Contact[] {
    return Array.from(this.contacts.values());
  }

  /**
   * Update the search index for a specific contact.
   * Creates a normalized token string for fuzzy-like matching.
   */
  private updateIndex(contact: Contact) {
    // Remove existing index if present to avoid duplicates
    this.searchIndex = this.searchIndex.filter(i => i.id !== contact.id);

    // Create a searchable string containing all relevant fields
    const searchableText = [
      contact.name,
      contact.first_name,
      contact.last_name,
      contact.phone_number,
      contact.email,
      contact.company_name,
      contact.city,
      contact.state
    ].filter(Boolean).join(' ').toLowerCase();

    // Remove special chars for easier matching (e.g. phone formatting)
    const normalizedTokens = searchableText.replace(/[^a-z0-9\s@]/g, '');

    this.searchIndex.push({
      id: contact.id,
      tokens: normalizedTokens
    });
  }

  /**
   * efficient local search implementation
   */
  search(query: string): Contact[] {
    if (!query) return this.getAll();

    const normalizedQuery = query.toLowerCase().replace(/[^a-z0-9\s@]/g, '');
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);

    // Score-based matching could go here, but strict inclusion is usually enough for this scale
    const matches = this.searchIndex.filter(item => {
        // AND logic: all search terms must be present in the contact tokens
        return terms.every(term => item.tokens.includes(term));
    });

    return matches.map(m => this.contacts.get(m.id)!);
  }
}

export const contactCache = new ContactCacheService();
