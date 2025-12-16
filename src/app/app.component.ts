import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    // Check if jeep-sqlite element is in the DOM
    const jeepElement = document.querySelector('jeep-sqlite');
    const isDefined = customElements.get('jeep-sqlite');
    
    console.log('AppComponent ngOnInit - jeep-sqlite check:');
    console.log('  Element in DOM:', !!jeepElement);
    console.log('  Custom element defined:', !!isDefined);
    
    if (jeepElement) {
      console.log('  Element attributes:', Array.from(jeepElement.attributes).map(attr => `${attr.name}="${attr.value}"`));
    }
  }
}
