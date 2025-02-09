// Volunteer Events Interface

export interface VolunteerEvents {
    items:          Item[];
    totalItemCount: number;
    sequenceId:     number;
}

export interface Item {
    eventId:       number;
    eventName:     null | string;
    domainId:      number;
    canView:       boolean;
    startDateTime: Date;
    endDateTime:   Date;
    timeZone:      string;
    projectId:     number;
    projectName:   string;
    statuses:      Status[];
}

export interface Status {
    date:   Date;
    status: number;
}

