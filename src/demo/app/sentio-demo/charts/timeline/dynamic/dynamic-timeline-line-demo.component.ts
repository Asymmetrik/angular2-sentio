import { Component, ViewChild, ViewEncapsulation } from '@angular/core';

import { AutoBrushTimelineChart, Series, TimelineChart } from '@asymmetrik/sentio';

import { DynamicTimelineDirective } from '../../../../../../sentio/charts/timeline/dynamic/dynamic-timeline.directive';

@Component({
	selector: 'dynamic-timeline-line-demo',
	templateUrl: 'dynamic-timeline-line-demo.component.html',
	styleUrls: [ 'dynamic-timeline-line-demo.component.scss' ],
	encapsulation: ViewEncapsulation.None
})
export class DynamicTimelineLineDemoComponent {

	now = Date.now();
	oneDay = 24 * 60 * 60 * 1000;
	months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];

	quickLinks = [
		{ label: '1d',  value: this.oneDay },
		{ label: '1w',  value: 7 * this.oneDay },
		{ label: '1m',  value: 30 * this.oneDay },
		{ label: '6m',  value: 180 * this.oneDay },
		{ label: '1y',  value: 365 * this.oneDay },
		{ label: '5y',  value: 5 * 365 * this.oneDay },
		{ label: 'all', value: 9999999999 * this.oneDay }
	];

	// Context
	dateString: string;
	valueString: string;

	// Dynamic timeline ref
	@ViewChild(DynamicTimelineDirective) dynamicTimelineRef: DynamicTimelineDirective;

	// Timeline
	timelineData: any[] = [];
	timelineSeries: Series[] = [];

	// Brush
	brushData: any[] = [];
	brushSeries: Series[] = [];

	timelineReady(chart: TimelineChart) {
		chart.dispatch()
			.on('pointMouseover', this.updateContextPoint)
			.on('pointMouseout', this.updateContextNoPoint);
	}

	brushReady(chart: AutoBrushTimelineChart) {
		// Nothing
	}

	zoom(level: number) {
		this.dynamicTimelineRef.setBrush([ this.now - level, this.now ]);
	}

	getDateString(d: number) {
		let toReturn;

		if (null != d) {
			const dtg = new Date(d);
			toReturn = `${this.months[dtg.getMonth()]} ${dtg.getDate()}, ${dtg.getFullYear()}`;
		}

		return toReturn;
	}

	updateContextPoint(d: any) {
		this.dateString = this.getDateString(d.data[0]);
		this.valueString = `$${d.data[1]}`;
	}

	updateContextNoPoint() {
		const extent = this.dynamicTimelineRef.timeline.xScale().domain();
		if (null != extent) {
			const fromString = this.getDateString(extent[0]);
			const toString = this.getDateString(extent[1]);

			this.dateString = `${fromString} - ${toString}`;
			this.valueString = null;
		}

	}

}