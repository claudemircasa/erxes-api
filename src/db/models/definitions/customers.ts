import { Document, Schema } from 'mongoose';

import { ILink, linkSchema } from './common';
import { CUSTOMER_SELECT_OPTIONS } from './constants';

import { field, schemaWrapper } from './utils';

export interface ILocation {
  remoteAddress: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  hostname: string;
  language: string;
  userAgent: string;
}

export interface ILocationDocument extends ILocation, Document {}

export interface IVisitorContact {
  email?: string;
  phone?: string;
}

export interface IVisitorContactDocument extends IVisitorContact, Document {}

interface ILinkDocument extends ILink, Document {}

export interface ICustomer {
  state?: 'visitor' | 'lead' | 'customer';

  scopeBrandIds?: string[];
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  sex?: number;
  primaryEmail?: string;
  emails?: string[];
  avatar?: string;
  primaryPhone?: string;
  phones?: string[];

  ownerId?: string;
  position?: string;
  department?: string;
  leadStatus?: string;
  hasAuthority?: string;
  description?: string;
  doNotDisturb?: string;
  emailValidationStatus?: string;
  links?: ILink;
  relatedIntegrationIds?: string[];
  integrationId?: string;
  tagIds?: string[];

  // TODO migrate after remove 1row
  companyIds?: string[];

  mergedIds?: string[];
  status?: string;
  customFieldsData?: any;
  trackedData?: any;
  location?: ILocation;
  visitorContactInfo?: IVisitorContact;
  deviceTokens?: string[];
  code?: string;
  isOnline?: boolean;
  lastSeenAt?: Date;
  sessionCount?: number;
}

export interface ICustomerDocument extends ICustomer, Document {
  _id: string;
  location?: ILocationDocument;
  links?: ILinkDocument;
  visitorContactInfo?: IVisitorContactDocument;
  profileScore?: number;
  status?: string;
  createdAt: Date;
  modifiedAt: Date;
  deviceTokens?: string[];
  searchText?: string;
}

/* location schema */
export const locationSchema = new Schema(
  {
    remoteAddress: field({ type: String, label: 'Remote address' }),
    country: field({ type: String, label: 'Country' }),
    countryCode: field({ type: String, label: 'Country code' }),
    city: field({ type: String, label: 'City' }),
    region: field({ type: String, label: 'Region' }),
    hostname: field({ type: String, label: 'Host name' }),
    language: field({ type: String, label: 'Language' }),
    userAgent: field({ type: String, label: 'User agent' }),
  },
  { _id: false },
);

export const visitorContactSchema = new Schema(
  {
    email: field({ type: String, label: 'Email' }),
    phone: field({ type: String, label: 'Phone' }),
  },
  { _id: false },
);

const getEnum = (fieldName: string): string[] => {
  return CUSTOMER_SELECT_OPTIONS[fieldName].map(option => option.value);
};

export const customerSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),

    state: field({ type: String, esType: 'keyword', label: 'State' }),

    createdAt: field({ type: Date, label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),
    avatar: field({ type: String, optional: true, label: 'Avatar' }),

    firstName: field({ type: String, label: 'First name', optional: true }),
    lastName: field({ type: String, label: 'Last name', optional: true }),
    birthDate: field({ type: Date, label: 'Date of birth', optional: true }),
    sex: field({
      type: Number,
      label: 'Sex',
      optional: true,
      default: 0,
      enum: getEnum('SEX'),
      selectOptions: CUSTOMER_SELECT_OPTIONS.SEX,
    }),

    primaryEmail: field({ type: String, label: 'Primary Email', optional: true, esType: 'email' }),
    emails: field({ type: [String], optional: true, label: 'Emails' }),
    emailValidationStatus: field({
      type: String,
      enum: getEnum('EMAIL_VALIDATION_STATUSES'),
      default: 'unknown',
      label: 'Email validation status',
      esType: 'keyword',
      selectOptions: CUSTOMER_SELECT_OPTIONS.EMAIL_VALIDATION_STATUSES,
    }),

    primaryPhone: field({ type: String, label: 'Primary Phone', optional: true }),
    phones: field({ type: [String], optional: true, label: 'Phones' }),
    profileScore: field({ type: Number, index: true, optional: true, label: 'Profile score' }),

    ownerId: field({ type: String, optional: true, label: 'Owner' }),
    position: field({ type: String, optional: true, label: 'Position', esType: 'keyword' }),
    department: field({ type: String, optional: true, label: 'Department' }),

    leadStatus: field({
      type: String,
      enum: getEnum('LEAD_STATUS_TYPES'),
      optional: true,
      label: 'Lead Status',
      esType: 'keyword',
      selectOptions: CUSTOMER_SELECT_OPTIONS.LEAD_STATUS_TYPES,
    }),

    status: field({
      type: String,
      enum: getEnum('STATUSES'),
      default: 'active',
      optional: true,
      label: 'Status',
      index: true,
      esType: 'keyword',
      selectOptions: CUSTOMER_SELECT_OPTIONS.STATUSES,
    }),

    hasAuthority: field({ type: String, optional: true, label: 'Has authority' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    doNotDisturb: field({
      type: String,
      optional: true,
      label: 'Do not disturb',
    }),
    links: field({ type: linkSchema, default: {}, label: 'Links' }),

    relatedIntegrationIds: field({ type: [String], optional: true }),
    integrationId: field({ type: String, optional: true, label: 'Integration' }),
    tagIds: field({ type: [String], optional: true, index: true, label: 'Tags' }),

    // Merged customer ids
    mergedIds: field({ type: [String], optional: true }),

    trackedData: field({ type: Object, optional: true, label: 'Tracked Data' }),
    customFieldsData: field({ type: Object, optional: true, label: 'Custom fields data' }),

    location: field({ type: locationSchema, optional: true, label: 'Location' }),

    // if customer is not a user then we will contact with this visitor using
    // this information
    visitorContactInfo: field({
      type: visitorContactSchema,
      optional: true,
      label: 'Visitor contact info',
    }),

    deviceTokens: field({ type: [String], default: [] }),
    searchText: field({ type: String, optional: true, index: true }),
    code: field({ type: String, label: 'Code', optional: true }),

    isOnline: field({ type: Boolean, label: 'Is online', optional: true }),
    lastSeenAt: field({ type: Date, label: 'Last seen at', optional: true }),
    sessionCount: field({ type: Number, label: 'Session count', optional: true }),
  }),
);
