package apps.aaa.teamsite.pages.page;

import com.adobe.cq.sightly.WCMUse;
import com.adobe.cq.sightly.SightlyWCMMode;

public class TeamsitePage extends WCMUse {
    private SightlyWCMMode _sightlyWCMMode;
    private boolean _isSearchEngine = false;

    @Override
    public void activate() throws Exception {
        this._sightlyWCMMode = this.getWcmMode();
    }

    public String getIsPublisher() {
        if(this._sightlyWCMMode.isEdit() || this._sightlyWCMMode.isDesign()) {
            return "false";
        }
        else if(this._sightlyWCMMode.isPreview()){
                return "true";
        }else{
            return "true";
        }
    }

    public boolean getIsSearchEngine(){
        String[] selectors = this.getRequest().getRequestPathInfo().getSelectors();

        for(String selector : selectors){
            if(selector.equalsIgnoreCase("searchengine")){
                this._isSearchEngine = true;
                break;
            }
        }

        return this._isSearchEngine;
    }

    public boolean getUseRouter() {
        boolean isPublisher = Boolean.parseBoolean(getIsPublisher());
        if(!this.getIsSearchEngine()) {
            return isPublisher;
        }else{
            return false;
        }
    }

    public String getMetaWcmMode(){
        return this._sightlyWCMMode.toString();
    }
}