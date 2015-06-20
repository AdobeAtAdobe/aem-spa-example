package apps.aaa.teamsite.components.work.more_work_thumbnail_renderer;

import com.adobe.cq.sightly.WCMUse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.resource.ResourceUtil;

public class MoreWorkThumbnailRenderer extends WCMUse {
    private Resource _referencedResource = null;
    private ValueMap _valueMapReferenceResource = null;
    private String _thumbnailPath = "";

    @Override
    public void activate() throws Exception {
        String workPagePath = null;
        try{
            workPagePath = this.getProperties().get("workPage",String.class);
        }catch(Exception exc){}

        try{
            if(workPagePath != null) {
                this._referencedResource = this.getResourceResolver().resolve(workPagePath).getChild("jcr:content");
            }else{
                this._referencedResource = this.getResource().getChild("jcr:content");
            }

            if(this._referencedResource != null){
                this._valueMapReferenceResource = ResourceUtil.getValueMap(this._referencedResource);

                if(this._referencedResource.getChild("image") != null){
                    //set the thumbnail path
                    this._thumbnailPath =  this._referencedResource.getPath() + "/image/file";
                }
            }
        }catch(Exception exc){}
    }

    public ValueMap getWorkPageProperties() {
        return this._valueMapReferenceResource;
    }

    public String getWorkPagePath() {
        String workPagePath = "";
        if(this._referencedResource != null){
            workPagePath = this._referencedResource.getParent().getPath();
        }
        return workPagePath;
    }

    public String getThumbnailImageBasePath() {
        //content/teamsite/work/jcr:content/image/file.img.430.high.png we return the base of
        //content/teamsite/work/jcr:content/image/file so we can append on the resolutions we need
        if(this._thumbnailPath.length() > 0){
            return this._thumbnailPath;
        }else{
            return null;
        }
    }

    public String getTitle() {
        if(this._valueMapReferenceResource != null){
            return this._valueMapReferenceResource.get("pageTitle","No Title");
        }else{
            return "No Title";
        }
    }
}