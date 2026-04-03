import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

export const catalog = defineCatalog(schema, {
  components: {
    Header: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        configPath: z.string().nullable(),
      }),
      slots: ['default'],
      description:
        'Page header with lock icon, title, description, and config file path display.',
    },

    Section: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        collapsible: z.boolean().nullable(),
        defaultOpen: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'Card-style field group with optional collapsible accordion.',
    },

    Collection: {
      props: z.object({
        title: z.string(),
        itemLabel: z.string(),
        statePath: z.string(),
        nameEditable: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'Dynamic entry list with add/remove buttons. Renders children per item.',
    },

    Field: {
      props: z.object({
        label: z.string(),
        type: z.enum([
          'text',
          'password',
          'select',
          'number',
          'textarea',
          'checkbox',
        ]),
        statePath: z.string(),
        required: z.boolean().nullable(),
        help: z.string().nullable(),
        placeholder: z.string().nullable(),
        options: z.array(z.string()).nullable(),
      }),
      description:
        'Form input field supporting text, password, select, number, textarea, and checkbox.',
    },

    SaveBar: {
      props: z.object({
        saveLabel: z.string().nullable(),
        resetLabel: z.string().nullable(),
      }),
      events: ['save', 'reset'],
      description: 'Bottom action bar with Reset and Save buttons.',
    },
  },

  actions: {
    save: {
      description: 'Persist the current configuration to disk.',
    },
    reset: {
      description: 'Reload configuration from disk, discarding changes.',
    },
    addItem: {
      params: z.object({ statePath: z.string() }),
      description: 'Add a new item to a collection at the given state path.',
    },
    removeItem: {
      params: z.object({ statePath: z.string(), index: z.number() }),
      description: 'Remove an item from a collection by index.',
    },
  },
});

export type AppCatalog = typeof catalog;
