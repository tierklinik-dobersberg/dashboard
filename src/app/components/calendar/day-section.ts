import { Directive, Input, TemplateRef } from '@angular/core';
import { DaySection, Schedule } from './types';

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
    when: (data: DaySection<T>) => boolean = (_: any) => true;
    
    constructor(public readonly templateRef: TemplateRef<any>) {}
}

@Directive({
    selector: '[tdDayHeaderDef]',
    exportAs: 'tdDayHeaderDef'
})
export class TdDayHeaderDef {
    constructor(public readonly templateRef: TemplateRef<any>) {}
}

@Directive({
    selector: '[tdDayScheduleDef]',
    exportAs: 'tdDayScheduleDef'
})
export class TdDayScheduleDef<T = any> {

    /**
     * A predicate function that is used by the calendar to
     * determine which day-section template to render
     */
    @Input('tdDayScheduleDefWhen')
    when: (data: Schedule<T>) => boolean = (_: any) => true;
    
    constructor(public readonly templateRef: TemplateRef<any>) {}
}