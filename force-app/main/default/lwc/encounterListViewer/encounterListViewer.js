import { LightningElement, track } from 'lwc';
import getEncounters from '@salesforce/apex/encounterListViewerController.getEncounters';

export default class EncounterListViewer extends LightningElement {
    
    @track encounters = [];
    @track filteredEncounters = [];
    isScheduledCategory = true; 
    activeTabValue = 'In Progress';
    searchTerm = '';

    connectedCallback() {
        this.loadEncounters();
    }

    loadEncounters() {
        getEncounters()
            .then((result) => {
                this.encounters = result;
                if(this.encounters.length != 0) {
                    this.sanitizeEncounters();
                    this.filterEncounters();
                }
            })
            .catch((error) => {
                console.error('Error loading encounters:', error);
            });
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        this.filterEncounters();
    }

    toggleUrgentEncounter() {
        this.isScheduledCategory = !this.isScheduledCategory;
        if (this.isScheduledCategory) {
            this.refs.scheduledBtn.variant = 'brand';
            this.refs.emergencyBtn.variant = 'brand-outline';
        } else {
            this.refs.scheduledBtn.variant = 'brand-outline';
            this.refs.emergencyBtn.variant = 'brand';
        }
        this.filterEncounters();
    }

    handleActiveTab(event) {
        this.activeTabValue = event.target.value;
        this.filterEncounters();
    }

    handleViewEncounter(event) {
        const url = event.currentTarget.dataset.link;
        if (url) {
            window.open(url, '_blank');
        }
    }

    sanitizeEncounters() {
        this.encounters = this.encounters.map(encounter => {
            const formattedTime = encounter.StartDate.split('T')[1].slice(0, 5);
            return {
                ...encounter,
                formattedTime,
                encounterLink: `/lightning/r/${encounter.Id}/view`,
                patientLink: `/lightning/r/${encounter.Patient}/view`, 
                doctorLink: `/lightning/r/${encounter.Doctor__c}/view` 
            };
        });
    }

    filterEncounters() {
        this.filteredEncounters = (this.encounters || []).filter(e => {
            // Category filter
            const isUrgent = e.Category === 'Emergency' || e.Category === 'Ambulatory';
            if (this.isScheduledCategory ? isUrgent : !isUrgent) {
                return false;
            }
            // Status filter
            if (e.Status !== this.activeTabValue) {
                return false;
            }
            // Search filter (optional)
            if (this.searchTerm) {
                const term = this.searchTerm.toLowerCase();
                const patient = (e.Patient?.Name || '').toLowerCase();
                const doctor = (e.Doctor__r?.Name || '').toLowerCase();
                const name = (e.Name || '').toLowerCase();
                if (!patient.includes(term) && !doctor.includes(term) && !name.includes(term)) {
                    return false;
                }
            }
            return true;
        });
    }

}