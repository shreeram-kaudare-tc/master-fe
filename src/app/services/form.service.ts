import { inject, Injectable } from '@angular/core';
import { GetDropdownListService } from './get-dropdown-list.service';


@Injectable({ providedIn: 'root' })

export class FormService {

  gds = inject(GetDropdownListService);


  constructor() { }



  normalizeBulkEntry(entry: any): any {
    const parsedEntry: any = {};

    const truthyValues = ['true', 'yes', 'active'];
    const falsyValues = ['false', 'no', 'inactive'];

    const forceStringFields = [
      'udise_code',
      'landline_number',
      'hos_mobile',
      'mobile_phone_used_for_teaching',
    ];

    Object.keys(entry).forEach(key => {
      const raw = entry[key];

      // Force these fields to STRING only
      if (forceStringFields.includes(key)) {
        parsedEntry[key] = raw?.toString();
        return;
      }

      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        const value = trimmed.toLowerCase();

        if (/^\[\s*'.*'\s*\]$/.test(trimmed)) {
          try {
            parsedEntry[key] = JSON.parse(trimmed.replace(/'/g, '"'));
          } catch {
            parsedEntry[key] = raw;
          }
        }

        else if (truthyValues.includes(value)) {
          parsedEntry[key] = true;
        } else if (falsyValues.includes(value)) {
          parsedEntry[key] = false;
        }

        else if (value === 'null') {
          parsedEntry[key] = null;
        } else if (value === 'undefined') {
          parsedEntry[key] = undefined;
        }

        // 👉 This will NOT run for forced-string fields now
        else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
          const numberValue = parseFloat(trimmed);
          parsedEntry[key] = Number.isInteger(numberValue) ? Math.floor(numberValue) : numberValue;
        }

        else {
          parsedEntry[key] = raw;
        }
      } else {
        parsedEntry[key] = raw;
      }
    });
    return parsedEntry;
  }


}
