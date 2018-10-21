import {Component, Directive, Input, TemplateRef, ElementRef, OnDestroy, ViewContainerRef} from '@angular/core';
import {CdkPortalOutlet} from '@angular/cdk/portal';
import {DaySection} from './types';

/**
 * Directive to define day section templates for the calendar component
 */
@Directive({
    selector: '[tdDaySectionDef]',
    exportAs: 'tdDaySectionDef',
})
export class TdDaySectionDef<T = any> {

    /**
     * A predicate function that is used by the calendar to
     * determine which day-section template to render
     */
    @Input('tdDaySectionDefWhen')
    when: (data: DaySection<T>) => boolean;
    
    constructor(public readonly templateRef: TemplateRef<any>) {}
}

@Component({
    selector: 'tdDaySectionOutlet',
    exportAs: 'tdDaySectionOutlet',
    template: '',
})
export class TdDaySectionOutlet implements OnDestroy {
    static mostRecentOutlet: TdDaySectionOutlet | undefined = undefined;

    constructor(public readonly view: ViewContainerRef) {
        TdDaySectionOutlet.mostRecentOutlet = this;
    }
    
    ngOnDestroy() {
        // If we are the last day section outlet created we need to
        // clear the static reference to avoid memory leaks
        if (this === TdDaySectionOutlet.mostRecentOutlet) {
            TdDaySectionOutlet.mostRecentOutlet = undefined;
        }
    }
}

