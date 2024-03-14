import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export const SAMPLE_JSON = {
  deliveryId: '913d3392-b849-424c-895b-6b35926cd3d1',
  deliveryType: 'BUSINESS',
  state: 'DRAFT',
  createdAt: '2024-03-12T17:31:08.000Z',
  updatedAt: '2024-03-12T17:31:10.000Z',
  distanceInMiles: 208.922,
  startLocation: {
    street: 'Wewatta St',
    city: 'Denver',
    state: 'CO',
    zip: '80202',
  },
  endLocation: {
    street: '2350 Tremont Pl',
    city: 'Denver',
    state: 'CO',
    zip: '80205',
  },
  items: [
    {
      id: '8cd5a46d-6fc8-41a8-a365-7fbc60fa95c3',
      lengthIn: 21,
      widthIn: 18,
      heightIn: 27,
      totalWeightLbs: 12.8984,
    },
  ],
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'jsonar';
  jsonSource = JSON.stringify({
    id: '',
    value: 22,
    isActive: false,
  });
  jsonTarget = JSON.stringify({
    id: '',
    value: 22,
    isActive: false,
  });
  validTargetJson = true;
  validSourceJson = true;
  flattenedProperties: { key: string; value: string }[] = [];
  sourceProperties: string[] = [''];
  propertyMap: { source: string; target: string }[] = [];
  query = '';

  constructor() {
    this.updatePropertyList(JSON.parse(this.jsonTarget as string));
    this.updateSourceProperties(JSON.parse(this.jsonSource as string));
  }
  onJsonTargetChange() {
    this.flattenedProperties = [];
    try {
      this.validTargetJson = true;
      this.updatePropertyList(JSON.parse(this.jsonTarget as string));
    } catch (e) {
      console.error(e);
      this.validTargetJson = false;
    }
  }

  onJsonSourceChange() {
    this.sourceProperties = [];
    try {
      this.validSourceJson = true;
      this.updateSourceProperties(JSON.parse(this.jsonSource as string));
    } catch (e) {
      this.validSourceJson = false;
    }
  }

  updateSourceProperties(object: any, prefix = '', isArray = false) {
    if (this.validSourceJson) {
      if (isArray) {
        if (object && typeof object === 'object') {
          this.updateSourceProperties(object, `${prefix}[ ].`);
        } else {
          this.sourceProperties.push(`${prefix}`);
        }
      } else {
        for (const key in object) {
          // check if its an array.
          if (Array.isArray(object[key])) {
            this.updateSourceProperties(
              object[key][0],
              `${prefix}${key}`,
              true
            );
          } else if (typeof object[key] === 'object') {
            this.updateSourceProperties(object[key], `${prefix}${key}.`);
          } else {
            this.sourceProperties.push(`${prefix}${key}`);
          }
        }
      }
    }
  }

  /**
   *
   * @param event the SOURCE property
   * @param item  the TARGET property
   */
  onPropertyChange(event: any, item: any) {
    let result = this.propertyMap.find((prop) => prop.target === item.key);
    if (result) {
      result.source = event.target.value;
    } else {
      this.propertyMap.push({ source: event.target.value, target: item.key });
    }
    console.log(this.propertyMap);
  }

  updatePropertyList(object: any, prefix = '', isArray = false) {
    if (this.validTargetJson) {
      if (isArray) {
        if (object && typeof object === 'object') {
          this.updatePropertyList(object, `${prefix}[ ].`);
        } else {
          this.flattenedProperties.push({
            key: `${prefix}`,
            value: `${typeof object}[]`,
          });
          this.onPropertyChange(
            { target: { value: `` } },
            { key: `${prefix}${object.key}` }
          );
        }
      } else {
        for (const key in object) {
          // check if its an array.
          if (Array.isArray(object[key])) {
            this.updatePropertyList(object[key][0], `${prefix}${key}`, true);
          } else if (typeof object[key] === 'object') {
            this.updatePropertyList(object[key], `${prefix}${key}.`);
          } else {
            this.flattenedProperties.push({
              key: `${prefix}${key}`,
              value: typeof object[key],
            });
            this.onPropertyChange(
              { target: { value: `` } },
              { key: `${prefix}${key}` }
            );
          }
        }
      }
    }
  }

  getValueForPropSelect(prop: any) {
    return this.propertyMap.find((p) => p.target === prop.key)?.source;
  }

  generateQuery() {
    this.query = `({\r\n`;
    this.propertyMap.forEach((prop) => {
      if (prop.source !== '')
        this.query += `  ${prop.target}: $${prop.source},\r\n`;
    });
    this.query += `})`;
  }
  generateJson() {}

  mapData() {
    this.propertyMap.forEach((prop, i) => {
      const result = this.sourceProperties.find((p) => p === prop.target);
      if (result) {
        this.propertyMap[i].source = result;
      }
    });
  }
}
