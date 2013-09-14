Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'iteration',
    comboboxConfig: {
        fieldLabel: 'Select an Iteration:',
        labelWidth: 100,
        width: 300
    },
            
    addContent: function() {
        
        this._makeStore();
    },
    
    _makeStore: function(){
         Ext.create('Rally.data.WsapiDataStore', {
            model: 'HierarchicalRequirement',
            fetch: ['FormattedID','Name'],
            pageSize: 100,
            autoLoad: true,
            filters: [this.getContext().getTimeboxScope().getQueryFilter()],
            listeners: {
                load: this._onConversationPostsLoaded,
                scope: this
            }
        }); 
    },
    
   onScopeChange: function() {
        this._makeStore();
    },
    
    _onConversationPostsLoaded: function(store, data){
            this.stories = data;
            Ext.create('Rally.data.WsapiDataStore', {
                model: 'ConversationPost',
                fetch: ['Text', 'Artifact'],  
                pageSize: 100,
                autoLoad: true,
                listeners: {
                    load: this._onAllDataLoaded,
                    scope: this
                }
            }); 
    },
       _onAllDataLoaded: function(store, data){
                var stories = [];
                var text;
                that = this
               if (data.length ===0) {
                    this._createGrid();  
               }
                Ext.Array.each(this.stories, function(story) {
                            var posts = [];
                            var ref = story.get('_ref');
                                    Ext.Array.each(data, function(post){
                                        if (ref === post.get("Artifact")._ref) {
                                            text = post.get("Text");
                                            posts.push(text);
                                        }
                                    });
                                    var s  = {
                                FormattedID: story.get('FormattedID'),
                                _ref: story.get("_ref"),  
                                Name: story.get('Name'),
                                Discussions: posts
                            };
                                    
                                     stories.push(s);
                                     that._createGrid(stories);
                 });

 },

     _createGrid: function(stories) {
        var myStore = Ext.create('Rally.data.custom.Store', {
                data: stories,
                pageSize: 100,  
            });
        if (!this.grid) {
        this.grid = this.add({
            xtype: 'rallygrid',
            itemId: 'mygrid',
            store: myStore,
            columnCfgs: [
                {
                   text: 'Formatted ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Name', dataIndex: 'Name'
                },
                {
                    text: 'Discussions', dataIndex: 'Discussions', flex: 2
                }
            ]
        });
         
         }else{
            this.grid.reconfigure(myStore);
         }
    }
    
});

