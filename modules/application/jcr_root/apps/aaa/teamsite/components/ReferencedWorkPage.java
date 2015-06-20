package apps.aaa.teamsite.components;

import com.adobe.cq.sightly.WCMUse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ValueMap;
import org.apache.sling.api.resource.ResourceUtil;

public class ReferencedWorkPage extends WCMUse {
    private Resource _referencedResource = null;
    private ValueMap _valueMapReferenceResource = null;
    private String _thumbnailPath = "";
    private Resource _projectInfo = null;

    @Override
    public void activate() throws Exception {
        String workPagePath = this.getProperties().get("workPage",String.class);
        if(workPagePath != null) {
            this._referencedResource = this.getResourceResolver().resolve(workPagePath).getChild("jcr:content");
            this._valueMapReferenceResource = ResourceUtil.getValueMap(this._referencedResource);
            if(this._referencedResource.getChild("image") != null){
                //set the thumbnail path
                this._thumbnailPath =  this._referencedResource.getPath() + "/image/file";
            };
        };
    }

    public ValueMap getWorkPageProperties() {
        return this._valueMapReferenceResource;
    }

    public String getThumbnailImageBasePath() {
        //content/teamsite/work/jcr:content/image/file.img.430.high.png we return the base of
        //content/teamsite/work/jcr:content/image/file so we can append on the resolutions we need
        if(this._valueMapReferenceResource != null){
            return this._thumbnailPath;
        }else{
            return null;
        }
    }

    public String getPath() {
        if(this._referencedResource != null){
            return this._referencedResource.getPath();
        }else{
            return null;
        }
    }

    public String getTitle() {
        if(this._valueMapReferenceResource != null){
            return this._valueMapReferenceResource.get("pageTitle", "No Title");
        }else{
            return "No Title";
        }
    }

    public String getHeroText() {
        Resource resourceHeroText = _referencedResource.getChild("hero-text");
        if(resourceHeroText != null ){
            return ResourceUtil.getValueMap(resourceHeroText).get("text",String.class);
        }else{
            return "No Hero Text" ;
        }
    }

    public String getHeroSummary() {
        Resource resourceHeroSummary = _referencedResource.getChild("hero-summary");
        if(resourceHeroSummary != null ){
            return ResourceUtil.getValueMap(resourceHeroSummary).get("text",String.class);
        }else{
            return "No Hero Summary";
        }
    }

    protected Resource getProjectIntoResource(){
        if(this._projectInfo == null ){
            this._projectInfo = _referencedResource.getChild("project-info");
            return this._projectInfo;
        }else{
            return this._projectInfo;
        }
    }

    public String getProjectName() {
        if(getProjectIntoResource() != null){
            if(getProjectIntoResource().getChild("name") != null){
                ValueMap rVm = ResourceUtil.getValueMap(getProjectIntoResource().getChild("name"));
                return rVm.get("text","No project name found");
            }
        }else{
            return "No project name found"
        }
    }

    public String getProjectDescription() {
        if(getProjectIntoResource() != null){
            if(getProjectIntoResource().getChild("description") != null){
                ValueMap rVm = ResourceUtil.getValueMap(getProjectIntoResource().getChild("description"));
                return rVm.get("text","No project description found");
            }
        }else{
            return "No project description found"
        }
    }

    public String getProjectYear() {
        if(getProjectIntoResource() != null){
            if(getProjectIntoResource().getChild("year") != null){
                ValueMap rVm = ResourceUtil.getValueMap(getProjectIntoResource().getChild("year"));
                return rVm.get("text","No project year found");
            }
        }else{
            return "No project year found"
        }
    }

    //TODO: categories
}