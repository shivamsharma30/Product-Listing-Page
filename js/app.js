;(function($){
    $(document).on('click', '.panel-heading.clickable', function(e){ 
        var $this = $(this); 
        if(!$this.hasClass('panel-collapsed')) { 
            $this.parents('.panel').find('.panel-body').slideDown(); 
            $this.addClass('panel-collapsed'); 
            $this.find('i').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up'); 
        } 
        else { 
            $this.parents('.panel').find('.panel-body').slideUp(); 
            $this.removeClass('panel-collapsed'); 
            $this.find('i').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down'); 
        } 
    })
    $(document).ready(function(){

        function viewModel() {
            var self = this;
            self.chosenPageId = ko.observable();
            self.pages = ko.observableArray(["Home", "About", "Product"]);
            self.template = ko.observable();
            self.plp = "productListingPage";
            self.goToPage = function (page){
                location.hash = page;
            }
            self.goToProduct = function (productid){
                location.hash = 'Product/'+ productid;
            }
        }
        function pageViewModel() {
            var self = this;
            self.name = ko.observable('Home');
            self.content = ko.observable('Home default content')
        }

        function productsViewModel() {
            var self = this;
            self.productArray = ko.observableArray();
            self.tempProductArray = ko.observableArray();
            self.allSize = ko.observableArray();
            self.allColor = ko.observableArray();
            self.allBrand = ko.observableArray();
            self.selectSize = ko.observableArray();
            self.selectColor = ko.observableArray();
            self.selectBrand = ko.observableArray();
            self.show = function(size, brand, color){
                console.log(size, brand, color);
                
            };
            self.sizeComputed = ko.computed(function() {
                console.log(this.selectSize());
                this.show(this.selectSize(),this.selectBrand(),this.selectColor());
           }, this);
        //color select 
            self.colorSelect = function(product,color){
                console.log(product,color);
                var size = [];
                var img;
                for(var sku in product.sku){
                    if(color == product.sku[sku].color){
                        size.push(product.sku[sku].size);
                        img = product.sku[sku].imageurl;
                    }
                }
                console.log(product.prodId, img,size);
                $("#"+product.prodId).css('background-image', 'url('+ img+')');
                $("#"+product.prodId+"size").text('size :'+size);
            }

        // Add Product to wishlist 
            self.changeColor = function(product){
                $("#"+product.prodId+"heart").toggleClass('far fa-heart heart fas fa-heart redHeart');
            }        
        }
        

        var vm = {
            Main: new viewModel(),
            Page: new pageViewModel(),
            Products: new productsViewModel()
        };

        Sammy(function () {
                this.get('#Home', function () {
                    $(".header").css("display","none");
                    console.log("HOMEPAGE",this.params.page);
                    vm.Main.chosenPageId(this.params.page);     
                    vm.Main.template("landing-page");
                    vm.Page.name("Home");
                });

                this.get('#productListingPage', function () {
                    console.log("plp page");

                    var dataArray = [];
                    var newDataArray = [];
                    var allsz = [];
                    var allcl = [];
                    var allbr = [];
                    $.ajax({url: "http://demo2828034.mockable.io/search/shirts", success: function(result){
                        for (var ob in result.items){
                            $.each(result.items, function(i, el) {
                                if($.inArray(el.brand, allbr) === -1) 
                                allbr.push(el.brand);
                                });
                            $.each(result.items, function(i, el) {
                                if($.inArray(el.size, allsz) === -1) 
                                    allsz.push(el.size);
                                });
                            $.each(result.items, function(i, el) {
                                if($.inArray(el.color, allcl) === -1) 
                                    allcl.push(el.color);
                                });    

                            var flag = true;
                            for(var temp in dataArray){
                                if(temp == result.items[ob].prodId){
                                    dataArray[temp].push(result.items[ob]);
                                    flag = false;
                                }   
                            }
                            if(flag === true)
                            dataArray[result.items[ob].prodId] = [result.items[ob]];
                            }

                            for(var productArrId in dataArray){
                                var colorArr = [];
                                var sizeArr = [];
                                var newColorArr = [];
                                var newSizeArr = [];
                                
                                for(var sku in dataArray[productArrId]){
                                    colorArr.push(dataArray[productArrId][sku].color);
                                    sizeArr.push(dataArray[productArrId][sku].size);
                                }
                                $.each(colorArr, function(i, el) {
                                     if($.inArray(el, newColorArr) === -1) newColorArr.push(el);
                                     });
                                $.each(sizeArr, function(i, el) {
                                    if($.inArray(el, newSizeArr) === -1) newSizeArr.push(el);
                                    });

                                //console.log(newColorArr,newSizeArr);
                                newDataArray.push({'prodId':productArrId, 'sku':dataArray[productArrId],'color':newColorArr, 'size':newSizeArr});
                            }
                            console.log(newDataArray); 

                            vm.Products.productArray(newDataArray); 
                            vm.Products.allSize(allsz);
                    vm.Products.allBrand(allbr);
                    vm.Products.allColor(allcl);     
                        },

                        error(err){
                        console.log("error",err);
                        }
                    }); 
                    

                    console.log('allsize',vm.Products.allSize(),vm.Products.allColor(),vm.Products.allBrand());
                    $(".header").css("display","block");
                    vm.Main.chosenPageId(this.params.page);     
                    vm.Main.template("productListingPage")
                    vm.Page.name("productListingPage");
                    
                });


                // this.get('#Product', function () {
                //     vm.Main.chosenPageId(this.params.page);     
                //     vm.Main.template("product-template")
                //     //vm.Page.name("About")
                //     //fetch product details here
                // });

                // this.get('#Product/:productid', function () {
                //     vm.Main.chosenPageId("Product");     
                //     vm.Main.template("product-template")
                //     //this.params.productid
                //     //vm.Page.name("About")
                //     //fetch product details here
                // });

                // this.get('#:page', function () {
                //     vm.Main.chosenPageId(this.params.page);     
                //     vm.Main.template("page-template") 
                // });
            }).run('#Home');
        ko.applyBindings(vm);
    });

})(jQuery);
