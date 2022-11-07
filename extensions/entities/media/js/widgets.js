$(document).off('click', '.widget-collapse');
$(document).on('click','.widget-collapse',function(){           
    $(this).parents('.widget').toggleClass('collapsed');
    $(this).parents('.widget').find('.content').slideToggle('linear',function(){
        stock_graph_adaptive_height();
        setTimeout(function() {
            //stock_chart.reflow();
        }, 20); 
    });
    var widgets = JSON.parse(localStorage.getItem('widgets'));
    if (!widgets.hasOwnProperty('results_info')){ widgets.results_info = { id: 'results-info' };  }
    widgets.results_info.collapsed = 'false';                
    if ($(this).parents('.widget').hasClass('collapsed')){ widgets.results_info.collapsed = 'true'; }
    localStorage.setItem('widgets',JSON.stringify(widgets));
});
$(document).off('click', '.results-info .edit .form.hidden-fields input');
$(document).on('click','.results-info .edit .form.hidden-fields input',function(){
    var id = $(this).attr('id').substring(2); 
    $('.results-info').find('.'+id).toggleClass('hide');
    $('.results-info').find('.label-'+id).toggleClass('hide');

    // Remember visible fields
    var widgets = JSON.parse(localStorage.getItem('widgets'));
    if (!widgets.hasOwnProperty('results_info')){ widgets.results_info = { id: 'results-info' };  }

    var hidden_fields = [];
    $('.results-info .edit .form.hidden-fields input').each(function(key,element){
        if (!$(element).is(':checked')){ hidden_fields.push($(element).attr('id').substring(2)); }
    });
    widgets.results_info.hidden_fields = hidden_fields;
    localStorage.setItem('widgets',JSON.stringify(widgets));        
});

$(document).ready(function(){
    var widgets = JSON.parse(localStorage.getItem('widgets'));
    if (widgets.hasOwnProperty('results_info') && widgets.results_info.hasOwnProperty('collapsed') && widgets.results_info.collapsed === 'false'){
        $('.widget.results-info').removeClass('collapsed').find('.content').show();
    }else{
        $('.widget.results-info').addClass('collapsed');
    }        
});
$(document).ready(function(){
    var widgets = JSON.parse(localStorage.getItem('widgets'));
    if (widgets.hasOwnProperty('results_info') && widgets.results_info.hasOwnProperty('hidden_fields')){
        $.each(widgets.results_info.hidden_fields,function(key,id){
            $('.results-info').find('.'+id).toggleClass('hide');
            $('.results-info').find('.label-'+id).toggleClass('hide');
            $('.results-info .edit input#v-'+id).prop('checked',false);
        });
    }
    $(':not(.slick-cloned) .changer-v2 select').each(function(){
        var id = $(this).attr('id');
        if (settings.hasOwnProperty($(this).attr('id'))){
            $(this).val(settings[id]);
        }
    });
});


function widgetShareholders(options = {}){
                                                      
        if (!options.target) options.target = '.widget.shareholders';        
        if (!options.data && stock.facts) options.data = stock.facts.Holders.Institutions;        
        
        if (config.debug) console.log('Widget Shareholders',options.data);
                            
        var categories  = [];
        var data        = [];
        $.each(options.data, function(label,value){ 
            categories.push(value.name); 
            data.push(value.totalShares);
        });     
        
        if (!categories || !data) return;
        
        $(options.target).removeClass('hide');
        if (!options.graph) options.graph = {
            series: data, 
            labels: categories,
            chart: { type: 'donut', fill: { type: 'gradient' }, height:420 },
            stroke:{ width:1 },
            legend: {
                position:'bottom',
                fontSize: '14px',
                fontFamily: 'gotham-regular',
                itemMargin: { horizontal: 10,vertical: 5 }                                        
            },
            plotOptions: {
                pie: {
                  donut:{
                      size:'95%',
                      labels: { 
                          show:true,
                          value:{ formatter: function(value, opts){ return parseFloat(value).toFixed(2)+ '%'; } },
                          total: {
                            show: true,
                            label: 'All',
                            color: '#7ebd0b',
                            formatter: function (chart) { return '100.00%'; }
                          }
                      }
                  }
                }
            }                                
        };
        new ApexCharts(document.getElementById('graph-shareholders'), options.graph).render();
}

function widgetFinancial(id,widget){
    if ($('.page-view:not(.slick-cloned) [data-type="financial_graph"][data-id="'+id+'"]').length === 0){      
        var template = $('.template-widget > .widget').clone();
        $(template).attr('data-id',id);
        $(template).attr('data-type','financial_graph');
                                        
        $.each(widget, function(key,value){
            $(template).find('.edit [data-id="'+key+'"]').val(value);
        });          
        $('.page-view:not(.slick-cloned) .widgets').append($(template));   
    }  
    if (!widget.hasOwnProperty('scope') && !widget.hasOwnProperty('range')) return;
    if (widget.scope===null || widget.range===null) return;
    var title = (widget.scope).replace(/([A-Z])/g, ' $1').trim()+ ' ('+widget.range+')';
    $('.page-view:not(.slick-cloned) [data-type="financial_graph"][data-id="'+id+'"]').find('.title h2').text(title);
    if (config.debug) console.log('Widget',widget);
    
    var categories  = [];
    var data        = [];
    var render      = false;
    
    if (stock.facts.Financials && stock.facts.Financials.hasOwnProperty('Income_Statement')){   
        $('.widget[data-id="'+id+'"]').css('minHeight','300px');      
        $.each(stock.facts.Financials.Income_Statement[widget.range], function(label,value){ 
            if (value[widget.scope]){
                categories.push(label.substring(0,4)); 
                data.push(value[widget.scope]);
                
                if (value[widget.scope] !== null && value[widget.scope] !== '0.00') render = true;
            }
        });                                                
        categories.reverse();
        data.reverse();
        var options = {
            series: [{ data: data, name: widget.scope+" [Usd]"}],
            xaxis: {
                axisBorder:{ color: settings.design.color_bg },
                categories: categories,
                tickAmount: 4,
                labels:{
                    offsetY: 10
                }
            },
            yaxis: {
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { 
                    show: false,
                    formatter: function (value) {
                        return format_price(value) + " $";
                    },
                    offsetX: -10,
                    offsetY: 10
                }
              },
            colors: [settings.design.color_base],
            chart: {
                type: (widget.chartType) ? widget.chartType : 'line',                       
                toolbar: { show: false },
                fontFamily: 'gotham-regular',
                foreColor: settings.design.color_label,
                height:$('.widget.shareholders .graph').height() ? $('.widget.shareholders .graph').height() : 450
            },
            dataLabels: {
                enabled:false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            grid: {
                strokeDashArray: 2,
                padding:{
                    top:0,
                    right:0,
                    bottom:-10,
                    left:-12
                }
            }
        };
        if (!render) $('.widget[data-id="'+id+'"]').hide();
        
        $('[data-type="financial_graph"][data-id="'+id+'"] .graph').html('');
        new ApexCharts(document.querySelector('[data-type="financial_graph"][data-id="'+id+'"] .graph'), options).render();
        //graph.render();
    }else{
        $('.widget[data-id="'+id+'"]').hide();
    }
}
 