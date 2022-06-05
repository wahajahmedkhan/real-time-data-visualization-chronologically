import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConfigurationComponent} from './configuration/configuration.component';
import {RouterModule, Routes} from '@angular/router';
import {MatSliderModule} from "@angular/material/slider";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

const routes: Routes = [
  {path: '', component: ConfigurationComponent},
  {
    path: 'data/:config',
    loadChildren: () => import('./time-travel-selector/time-travel-selector.module').then(m => m.TimeTravelSelectorModule)
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  declarations: [
    AppComponent,
    ConfigurationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    MatSliderModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSlideToggleModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
