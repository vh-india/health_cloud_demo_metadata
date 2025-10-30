import { LightningElement } from 'lwc';

export default class XdoVideoCallSettings extends LightningElement {
    videoPanelSizeValues = [
        {
            apiName: 'medium',
            label: 'Medium (66% of the screen size)'
        },
        {
            apiName: 'small',
            label: 'Small (33% of the screen size)'
        },
        {
            apiName: 'large',
            label: 'Large (100% of the screen size)'
        }
    ];
}