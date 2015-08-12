<%@page session="false" %>
<%@include file="/libs/foundation/global.jsp"%>
<%@ page import="org.apache.sling.jcr.api.SlingRepository" %>
<%@ page import="com.day.cq.security.UserManager" %>
<%@ page import="com.day.cq.security.UserManagerFactory" %>
<%@ page import="com.day.cq.security.User" %>
<%@ page import="com.day.cq.security.Authorizable" %>
<%@ page import="com.day.cq.security.profile.Profile" %>
<%@ page import="java.util.Iterator" %>
<%@ page import="java.util.List" %>
<%@ page import="java.util.ArrayList" %>
<%@ page import="org.apache.sling.commons.json.io.*" %>
<%@ page import="org.apache.sling.api.resource.Resource" %>
<%@ page import="org.apache.sling.api.resource.ResourceUtil" %>
<%@ page import="org.apache.sling.api.resource.ValueMap" %>
<%@ page import="com.day.cq.commons.TidyJSONWriter" %><%


    ValueMap thisResource = ResourceUtil.getValueMap(request.getResource());
    try
    {
        String mediaItems = thisResource.get("pages") ;

        final TidyJSONWriter writer = new TidyJSONWriter(response.getWriter());

        //Send the data back to the client using a TidyJSONWriter object
        writer.setTidy("true".equals(request.getParameter("tidy")));
        writer.object();
        writer.key("mediaItems").value(mediaItems);
        writer.endObject();

    }
    catch (Exception e)
    {
        System.out.println("myajaxsample Exception Occured: " + e.getMessage());
    }
    finally
    {
    }
%>