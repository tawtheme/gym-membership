import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth';
import { StorageService } from './services/storage';
import { MemberService } from './services/member';
import { SqliteService } from './services/sqlite.service';
import { DataService } from './services/data.service';
import { DatabaseInitService, DatabaseOperationsService } from './database';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(), 
    IonicStorageModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AuthService,
    StorageService,
    MemberService,
    SqliteService,
    DataService,
    DatabaseInitService,
    DatabaseOperationsService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
