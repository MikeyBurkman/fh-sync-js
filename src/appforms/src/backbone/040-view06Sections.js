SectionView=BaseView.extend({

  initialize: function(options) {
    this.options = options;
    _.bindAll(this, 'render');
    this.$el.addClass("fh_appform_section");
  },
  render: function(){
    this.options.parentEl.append(this.$el);
  }

});