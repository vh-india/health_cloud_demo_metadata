import { LightningElement, api } from 'lwc';
import { resolve as resourceResolver } from 'experience/resourceResolver';
import communityPath from '@salesforce/community/basePath';
import { NavigationMixin } from 'lightning/navigation';

export default class sdo_scom_item extends NavigationMixin(LightningElement) {
    @api 
    get item(){
        return this._item;
    }
    set item(value){
        this._item=value;
        this.isGenerateProductUrl = true;   
    }
    isGenerateProductUrl = false;
    productUrl = '';
    incrementCounter = communityPath + '/assets/icons/utility-sprite/svg/symbols.svg#ban'
    decrementCounter = communityPath + '/assets/icons/utility-sprite/svg/symbols.svg#new'

    get thumbnailImageUrl(){
        const thumbnailUrl =
        this.item.cartItem?.productDetails.thumbnailImage?.thumbnailUrl ||
        this.item.cartItem?.productDetails.thumbnailImage?.url ||
            '';
        const cmsImageScalingProps = { height: 150, width: 150 };
        return resourceResolver(thumbnailUrl, false, cmsImageScalingProps);
    }

    get imgAltText() {
        return (
            this.item.cartItem?.productDetails?.thumbnailImage?.alternateText ||
            this.item.cartItem?.productDetails?.name ||
            'image allt text'
        );
    }

    get amount(){
        return  this.item.cartItem.unitAdjustedPriceWithItemAdj;
    }

    get itemCount(){
       return  this.item.cartItem.quantity;
    }

    connectedCallback(){
        if(this.isGenerateProductUrl){
        this.generateProductUrl();
        }
    }
    generateProductUrl() {
        const productId = this.item.cartItem.productDetails.productId;
        if (productId) {
            this.caseHomePageRef = {
                type: 'standard__recordPage',
                attributes: {
                    objectApiName: 'Product2',
                    recordId: productId,
                    actionName: 'view',
                },
            };
            this[NavigationMixin.GenerateUrl](this.caseHomePageRef)
            .then(url => {
                this.productUrl = url;
                this.isGenerateProductUrl= false;
            });
        }
    } 
}