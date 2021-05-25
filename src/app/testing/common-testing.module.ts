import {Component, Input, NgModule, OnInit} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {TreeModule} from '@circlon/angular-tree-component';
import {
  DefaultWidgetRegistry, ISchema, SchemaFormModule, SchemaValidatorFactory, WidgetRegistry, ZSchemaValidatorFactory
} from 'ngx-schema-form';
import {HttpClientModule} from '@angular/common/http';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbar, MatToolbarModule} from '@angular/material/toolbar';
import {AppModule} from '../app.module';
import {LformsWidgetRegistry} from '../lib/lforms-widget-registry';
import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sf-test',
  template: `
    <sf-form [schema]="schema" [(model)]="model"></sf-form>
  `
})
export class TestComponent implements OnInit {

  @Input()
  schema: ISchema = {type: 'object', properties: {}};
  @Input()
  model: any;

  ngOnInit() {
  }
}

@NgModule({
  imports: [
    SchemaFormModule
  ],
  declarations: [TestComponent]
})
export class CommonTestingModule {

  static commonTestingImports: any[] = [
    AppModule,
    SchemaFormModule.forRoot(),
    TreeModule,
    HttpClientModule,
    NoopAnimationsModule,
    LayoutModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    NgbModule
  ];

  static commonTestingDeclarations: any [] = [];

  static commonTestProviders: any [] = [{provide: WidgetRegistry, useClass: LformsWidgetRegistry}, NgbActiveModal];

  static setUpTestBedConfig = (moduleConfig: any) => {
    beforeEach(() => {
      let declarations = CommonTestingModule.commonTestingDeclarations;
      let imports = CommonTestingModule.commonTestingImports;
      let providers = CommonTestingModule.commonTestProviders;
      declarations = moduleConfig.declarations ? [...declarations, ...moduleConfig.declarations] : declarations;
      imports = moduleConfig.imports ? [...imports, ...moduleConfig.imports] : imports;
      providers = moduleConfig.providers ? [...providers, ...moduleConfig.providers] : providers;

      TestBed.configureTestingModule({
        declarations,
        imports,
        providers
      });
    });
  };

  static setUpTestBed = (TestingComponent: any) => {
    CommonTestingModule.setUpTestBedConfig({declarations: [TestingComponent]});
  };

  static setupTestBedWithTestForm = () => {
    CommonTestingModule.setUpTestBedConfig({declarations: [TestComponent]});
  }
}
