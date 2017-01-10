import { Component, HostListener } from '@angular/core';

import * as sentio from '@asymmetrik/sentio';
import * as d3 from 'd3';

@Component({
	selector: 'basic-vertical-bar-chart-demo',
	templateUrl: './basic-vertical-bar-chart-demo.component.html'
})
export class BasicVerticalBarChartDemoComponent {

		model: any[] = [];

		chartReady(chart: any): void {
			chart.label(function(d: any) { return d.key + '&lrm; (' + d.value + ')'; });
		};

		update(): void {
			let newData: Object[] = [];
			let samples = 20;

			for (let i: number = 0; i < samples; i++) {
				newData.push({
					key: `key: ${i}`,
					value: Math.floor(Math.random() * 100)
				});
			}
			this.model = newData
				.sort((a: any, b: any) => { return b.value - a.value; })
				.slice(0, 12);
		};

	ngOnInit(): void {
		this.update();
	}
}