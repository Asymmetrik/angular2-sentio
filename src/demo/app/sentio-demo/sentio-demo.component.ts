import { Component, OnInit } from '@angular/core';

import * as sentio from '@asymmetrik/sentio';
import * as d3 from 'd3';

@Component({
	selector: 'sentio-demo',
	templateUrl: './sentio-demo.component.html'
})
export class SentioDemoComponent
implements OnInit {

	show: boolean = false;

	ngOnInit() {
		setTimeout(() => {
			this.show = true;
		}, 1000);
	}

}
