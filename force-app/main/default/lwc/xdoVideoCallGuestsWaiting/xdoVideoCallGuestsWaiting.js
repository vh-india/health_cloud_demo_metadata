import { LightningElement, api, wire} from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { openTab, focusTab } from 'lightning/platformWorkspaceApi';

export default class XdoVideoCallGuestsWaiting extends NavigationMixin(LightningElement) {
    @api appointment;

    guestsWaiting = true;

    connectedCallback(){
        console.log('The bird is the word', JSON.stringify(this.appointment));
    }

    closeModal(){
        const closeModalEvent = new CustomEvent('closemodal', {
            detail: {
                guestsWaiting: this.guestsWaiting
            },
            bubbles: false,
            composed: false
        });
        this.dispatchEvent(closeModalEvent);
    }

    admitGuest(){
        console.log('admit guests');
        this.guestsWaiting = false;
        this.showToast();
        this.navigateToRecordPage();
        this.closeModal();
    }

    navigateToRecordPage() {
        // this[NavigationMixin.GenerateUrl]({
        //     type: 'standard__recordPage',
        //     attributes: {
        //         recordId: this.appointment.personAccountId,
        //         objectApiName: 'Account',
        //         actionName: 'view'
        //     }
        // }).then(url => { window.open(url) });
        // if (!this.tabId) {
        //     return;
        // }
        openTab({
            recordId: this.appointment.personAccountId,
            focus: true
        }).catch((error) => {
            console.log(error);
        });
    }

    showToast() {
        const event = new ShowToastEvent({
            title: '',
            message: this.appointment.meetingWithName + ' was added to the call.',
            mode: 'dismissable',
            variant: 'success'
        });
        this.dispatchEvent(event);
    }
}