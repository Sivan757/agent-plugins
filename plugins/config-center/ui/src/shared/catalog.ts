import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

import {
  CONFIG_UI_ACTIONS,
  CONFIG_UI_COMPONENTS,
  CONFIG_UI_FIELD_TYPES,
  type ConfigUIAction,
  type ConfigUIComponent,
} from './catalog-contract';

/**
 * `satisfies Record<…, unknown>` ties this catalog to `catalog-contract.ts`:
 * omitting a contracted component or action is a type error, and adding one that
 * the contract does not list is too. That is what keeps the validator that reads
 * the contract honest about what the renderer actually supports.
 */
const components = {
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
      type: z.enum(CONFIG_UI_FIELD_TYPES),
      statePath: z.string(),
      required: z.boolean().nullable(),
      help: z.string().nullable(),
      placeholder: z.string().nullable(),
      options: z.array(z.string()).nullable(),
      // Optional: render this field only while another field holds one of
      // the listed values. Used to show the inputs of the selected
      // authentication mode instead of every mode at once.
      visibleWhen: z
        .object({
          statePath: z.string(),
          oneOf: z.array(z.string()).nullable().optional(),
          equals: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
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
} satisfies Record<ConfigUIComponent, unknown>;

const actions = {
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
} satisfies Record<ConfigUIAction, unknown>;

export const catalog = defineCatalog(schema, { components, actions });

export type AppCatalog = typeof catalog;
