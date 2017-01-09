import { Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChange, Output } from '@angular/core';
import * as sentio from '@asymmetrik/sentio';

import { ChartWrapper } from '../util/chart-wrapper.util';
import { ResizeDimension, ResizeUtil } from '../util/resize.util';


@Directive({
	selector: 'sentioTimeline'
})
export class TimelineDirective
	implements OnChanges, OnDestroy, OnInit {

	@Input() model: Object[];
	@Input() markers: Object[];
	@Input() yExtent: Object[];
	@Input() xExtent: Object[];

	@Input() resizeWidth: boolean;
	@Input() resizeHeight: boolean;
	@Input() duration: number;

	// Configure callback function for chart
	@Input('configure') configureFn: (chart: any) => void;

	// Timeline filter/brush support
	@Input() filterEnabled: boolean;
	@Input('filter') filterState: Object[];
	@Output() filterChange: EventEmitter<Object[]> = new EventEmitter<Object[]>();

	// Interaction events
	@Output() markerOver: EventEmitter<Object> = new EventEmitter<Object>();
	@Output() markerOut: EventEmitter<Object> = new EventEmitter<Object>();
	@Output() markerClick: EventEmitter<Object> = new EventEmitter<Object>();

	chartWrapper: ChartWrapper;
	resizeUtil: ResizeUtil;

	constructor(el: ElementRef) {

		// Create the chart
		this.chartWrapper = new ChartWrapper(el, sentio.timeline.line());

		// Set up the resizer
		this.resizeUtil = new ResizeUtil(el, (this.resizeHeight || this.resizeWidth));

	}

	/**
	 * For the timeline, both dimensions scale independently
	 */
	setChartDimensions(dim: ResizeDimension): void {

		let resize = false;

		if (null != dim.width && this.chartWrapper.chart.width() !== dim.width) {

			// pin the height to the width
			this.chartWrapper.chart
				.width(dim.width);
			resize = true;

		}

		if (null != dim.height && this.chartWrapper.chart.height() !== dim.height) {

			// pin the height to the width
			this.chartWrapper.chart
				.height(dim.height);
			resize = true;

		}

		if (resize) {
			this.chartWrapper.chart.resize();
		}
	}

	/**
	 * Did the state of the filter change?
	 */
	didFilterChange = (current: Object[], previous: Object[]) => {

		// Deep compare the filter
		if (current === previous ||
			(null != current && null != previous
			&& current[0] === previous[0]
			&& current[1] === previous[1])) {
			return false;
		}

		// We know it changed
		return true;
	}

	@HostListener('window:resize', ['$event'])
	onResize(event: any) {
		this.resizeUtil.resizeObserver.next(event);
	}

	ngOnInit() {

		// Initialize the chart
		this.chartWrapper.initialize();

		// Set the filter (if it exists)
		if (null != this.filterState) {
			this.chartWrapper.chart.setFilter(this.filterState);
		}

		// register for the marker events
		this.chartWrapper.chart.dispatch().on('markerClick', (p: any) => { this.markerClick.emit(p); });
		this.chartWrapper.chart.dispatch().on('markerMouseover', (p: any) => { this.markerOver.emit(p); });
		this.chartWrapper.chart.dispatch().on('markerMouseout', (p: any) => { this.markerOut.emit(p); });

		// register for the filter end event
		this.chartWrapper.chart.dispatch().on('filterend', (fs: any) => {
			// If the filter actually changed, emit the event
			if (this.didFilterChange(fs, this.filterState)) {
				setTimeout(() => { this.filterChange.emit(fs); });
			}
		});

		// Set up the resize callback
		this.resizeUtil.resizeSource
			.subscribe(() => {

				// Do the resize operation
				this.setChartDimensions(this.resizeUtil.getSize());
				this.chartWrapper.chart.redraw();

			});

		// Set the initial size of the chart
		this.setChartDimensions(this.resizeUtil.getSize());
		this.chartWrapper.chart.redraw();

	}

	ngOnDestroy() {
		this.resizeUtil.destroy();
	}

	ngOnChanges(changes: { [key: string]: SimpleChange }) {

		let resize: boolean = false;
		let redraw: boolean = false;

		// Configure the chart
		if (changes['configureFn'] && changes['configureFn'].isFirstChange()) {
			this.chartWrapper.configure(this.configureFn);
		}

		if (changes['model']) {
			this.chartWrapper.chart.data(this.model);
			redraw = redraw || !changes['model'].isFirstChange();
		}
		if (changes['markers']) {
			this.chartWrapper.chart.markers(this.markers);
			redraw = redraw || !changes['markers'].isFirstChange();
		}

		if (changes['yExtent']) {
			this.chartWrapper.chart.yExtent().overrideValue(this.yExtent);
			redraw = redraw || !changes['yExtent'].isFirstChange();
		}
		if (changes['xExtent']) {
			this.chartWrapper.chart.xExtent().overrideValue(this.xExtent);
			redraw = redraw || !changes['xExtent'].isFirstChange();
		}
		if (changes['duration']) {
			this.chartWrapper.chart.duration(this.duration);
		}

		if (changes['filterEnabled']) {
			this.chartWrapper.chart.filter(this.filterEnabled);
			redraw = redraw || !changes['filterEnabled'].isFirstChange();
		}
		if (changes['filterState'] && !changes['filterState'].isFirstChange()) {

			// Only apply it if it actually changed
			if (this.didFilterChange(changes['filterState'].currentValue, changes['filterState'].previousValue)) {

				this.chartWrapper.chart.setFilter(this.filterState);
				redraw = true;

			}

		}

		// Only redraw once if necessary
		if (resize) {
			this.chartWrapper.chart.resize();
		}
		if (redraw) {
			this.chartWrapper.chart.redraw();
		}
	}

}
