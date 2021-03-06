/**
 * Component to display array of object fields in a table format with field names at the top,
 * add button at the bottom, delete button for each row, label for the table at the left etc.
 *
 * It is optionally controlled by a boolean widget above the table.
 */
import {AfterViewInit, Component, DoCheck, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ArrayWidget, FormProperty} from 'ngx-schema-form';
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {faAngleDown} from '@fortawesome/free-solid-svg-icons';
import {faAngleRight} from '@fortawesome/free-solid-svg-icons';
import {PropertyGroup} from 'ngx-schema-form/lib/model';
import {Util} from '../../util';
/**
 * Component to display array of object fields in a table format with field names at the top,
 * add button at the bottom, delete button for each row, label for the table at the left etc.
 *
 * It is optionally controlled by a boolean widget above the table.
 */
import {LfbArrayWidgetComponent} from '../lfb-array-widget/lfb-array-widget.component';


@Component({
  selector: 'lfb-table',
  template: `
    <ng-container *ngIf="booleanControlled">
      <lfb-boolean-controlled
        [(bool)]="booleanControlledOption"
        [controlWidthClass]="controlWidthClass"
        [labelWidthClass]="labelWidthClass"
        [label]="booleanLabel"
        [labelPosition]="labelPosition"
        [helpMessage]="schema.description"
      ></lfb-boolean-controlled>
    </ng-container>

    <div *ngIf="!booleanControlled || booleanControlledOption" class="widget form-group m-0"
         [ngClass]=
           "{'row': labelPosition === 'left'}">
      <div [ngClass]="labelWidthClass + ' pl-0 pr-1'">
        <button *ngIf="!noCollapseButton" href="#" type="button"
                [ngClass]="{'float-sm-right': labelPosition === 'left'}"
                class="btn btn-default collapse-button" (click)="isCollapsed = !isCollapsed"
                [attr.aria-expanded]="!isCollapsed" [attr.aria-controls]="tableId">
          <fa-icon [icon]="isCollapsed ? faRight : faDown" aria-hidden="true"></fa-icon>
        </button>
        <lfb-label *ngIf="!noTableLabel" [title]="schema.title" [helpMessage]="schema.description" [for]="id"></lfb-label>
      </div>
      <div class="p-0 card {{controlWidthClass}}" [attr.id]="tableId">
        <table class="table table-borderless table-sm lfb-table" *ngIf="formProperty.properties.length > 0">
          <thead *ngIf="!noHeader" class="thead-light">
          <tr class="d-flex">
            <th *ngFor="let showField of getShowFields()" class="col-sm{{showField.col ? ('-'+showField.col) : ''}}">
              <lfb-title
                [title]="showField.title || getTitle(formProperty.properties[0], showField.field)"
                [helpMessage]="getProperty(formProperty.properties[0], showField.field).schema.description"
              ></lfb-title>
            </th>
            <th *ngIf="!singleItem" class="col-sm-1"></th>
          </tr>
          </thead>
          <tbody [ngbCollapse]="isCollapsed">
          <tr class="d-flex" *ngFor="let itemProperty of formProperty.properties">
            <td *ngFor="let showField of getShowFields()" class="col-sm{{showField.col ? ('-'+showField.col) : ''}}">
              <lfb-form-element nolabel="true" [formProperty]="getProperty(itemProperty, showField.field)"></lfb-form-element>
            </td>
            <td [ngClass]="{'d-none': formProperty.properties.length === 1}" class="col-sm-1 align-middle action-column">
              <button (click)="removeItem(itemProperty)" class="btn btn-default btn-link btn-sm array-remove-button"
                      [attr.disabled]="isRemoveButtonDisabled() ? '' : null"
                      *ngIf="!(schema.hasOwnProperty('minItems') &&
                               schema.hasOwnProperty('maxItems') &&
                               schema.minItems === schema.maxItems)"
                      matTooltip="Remove" matTooltipPosition="above"
              >
                <fa-icon [icon]="faRemove" aria-hidden="true"></fa-icon></button>
            </td>
          </tr>
          </tbody>
        </table>
        <button (click)="addItem()" class="btn-sm btn-light btn-link array-add-button"
                [attr.disabled]="isAddButtonDisabled() ? '' : null"
                *ngIf="!singleItem &&
                (!(schema.hasOwnProperty('minItems') && schema.hasOwnProperty('maxItems') && schema.minItems === schema.maxItems))"
        >
          <fa-icon [icon]="faAdd" aria-hidden="true"></fa-icon> {{addButtonLabel}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .action-column {
      text-align: end;
    }
    .collapse-button {
      padding-left: 5px;
      padding-right: 5px;
      margin-right: 5px;
      margin-left: 2px;
    }

    .collapse-button.float-sm-right {
      margin-right: 0;
      margin-left: 2px;
    }

    .lfb-table {
      margin-bottom: 0;
    }
    .lfb-table th {
      text-align: center;
    }
    .lfb-table th, .lfb-table td {
      padding: 0;
  /*    vertical-align: bottom; */
    }
    .table-header {
      font-weight: normal;
    }
  `]
})
export class TableComponent extends LfbArrayWidgetComponent implements AfterViewInit, DoCheck {

  static seqNum = 0;
  // Icons for buttons.
  faAdd = faPlusCircle;
  faRemove = faTrash;
  faRight = faAngleRight;
  faDown = faAngleDown;

  isCollapsed = false;
  addButtonLabel = 'Add'; // Default label
  noCollapseButton = false;
  noTableLabel = false;
  noHeader = false;
  // Flag to control hiding of add/remove buttons.
  singleItem = false;
  keyField = 'type'; // Key property of the object, based on which some fields could be hidden/shown.
  booleanControlledOption = false;
  booleanControlled = false;
  tableId = 'tableComponent'+TableComponent.seqNum++;


  /**
   * Make sure at least one row is present for zero length array?
   */
  ngDoCheck(): void {
    if(this.booleanControlled) {
      this.booleanControlledOption = this.booleanControlledOption || !Util.isEmpty(this.formProperty.value);
    }
    if (this.formProperty.properties.length === 0 && this.booleanControlledOption) {
      this.addItem();
    }

  }


  /**
   * Initialize
   */
  ngAfterViewInit() {
    super.ngAfterViewInit();
    const widget = this.formProperty.schema.widget;
    this.addButtonLabel = widget && widget.addButtonLabel
      ? widget.addButtonLabel : 'Add';

    this.noTableLabel = !!widget.noTableLabel;
    this.noCollapseButton = !!widget.noCollapseButton;
    this.singleItem = !!widget.singleItem;
    this.booleanControlled = !!widget.booleanControlled;
    if(widget.booleanControlled) {
      this.booleanControlledOption = !!widget.booleanControlledOption;
    }

    this.booleanControlledOption = this.booleanControlledOption || !Util.isEmpty(this.formProperty.value);

    const singleItemEnableSource = this.formProperty.schema.widget ? this.formProperty.schema.widget.singleItemEnableSource : null;
    // Although intended to be source agnostic, it is mainly intended for 'repeats' field as source.
    // For example, when repeats is false, The initial field is only one row.
    // The requirement is:
    // . When source is false, hide add/remove buttons.
    // . Source if present and is true means show the buttons.
    // . Absence of source condition means the default behavior which is show the buttons.
    const prop = singleItemEnableSource ? this.formProperty.searchProperty(singleItemEnableSource) : null;
    if (prop) {
      prop.valueChanges.subscribe((newValue) => {
        if (newValue === false) {
          // If already has multiple items in the array, remove all items except first one.
          if (this.formProperty.properties.length > 1) {
            this.formProperty.properties = (this.formProperty.properties as FormProperty[]).slice(0, 1);
            this.formProperty.updateValueAndValidity(false, true);
          }
        }
        this.singleItem = !newValue;
        this.noCollapseButton = this.singleItem;
      });
    }
    const keyField = this.formProperty.findRoot().schema.widget.keyField;
    if (keyField) {
      this.keyField = keyField;
    }
    // Lookout for any changes to key field
    this.formProperty.searchProperty(this.keyField).valueChanges.subscribe((newValue) => {
      const showFields = this.getShowFields();
      this.noHeader = showFields.some((f) => f.noHeader);
    });
  }

  /**
   * Get fields to show.
   */
  getShowFields(): any [] {
    let ret: any [] = [];
    if (this.formProperty.schema.widget && this.formProperty.schema.widget.showFields) {
      const showFields = this.formProperty.schema.widget.showFields;
      ret = showFields.filter((field) => {
        return this.isVisible(field.field);
      });
    }
    return ret;
  }

  /**
   * Check visibility i.e. based on visibleIf of ngx-schema-form
   * @param propertyId - property id
   */
  isVisible(propertyId) {
    let ret = true;
    if (this.formProperty.properties.length > 0) {
      ret = Util.isVisible(this.formProperty.properties[0], propertyId);
    }
    return ret;
  }

  /**
   * Search for formProperty based on '.' delimited property ids.
   *
   * @param parentProperty -
   * @param propertyId -
   */
  getProperty(parentProperty: PropertyGroup, propertyId: string) {
    const path = propertyId.split('.');
    let p = parentProperty;
    for (const id of path) {
      p = p.getProperty(id);
    }
    return p;
  }

  /**
   * Get title of a field, given property id.
   * @param parentProperty -
   * @param propertyId -
   */
  getTitle(parentProperty, propertyId): string {
    const p = this.getProperty(parentProperty, propertyId);
    return p.schema && p.schema.title ? p.schema.title : Util.capitalize(propertyId);
  }



}
