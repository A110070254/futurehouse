

var isMagazineInitialized = false;

const MAGAZINE_CONFIGS = {
    'nostalgic': { 
        pages: 10, 
        folder: 'pages/nostalgic/',
        width: 900, height: 600 
    },
    'minimalist': { 
        pages: 14, 
        folder: 'pages/minimalist/',
        width: 900, height: 600
    },
    'japanese': { 
        pages: 18, 
        folder: 'pages/japanese/',
        width: 900, height: 600
    },
    'nordic': { 
        pages: 22, 
        folder: 'pages/nordic/',
        width: 900, height: 600
    },
    'industrial': { 
        pages: 14, 
        folder: 'pages/industrial/',
        width: 900, height: 600
    },
    'idol': { 
        pages: 14, 
        folder: 'pages/idol/',
        width: 900, height: 600
    }
};



function openMagazineModal(styleId) {
    const config = MAGAZINE_CONFIGS[styleId];
    if (!config) {
        console.error('找不到此風格的雜誌配置:', styleId);
        return;
    }

    const magazineModal = $('#magazineModal');
    const magazine = $('#genericMagazine');
    const canvas = $('#canvas');


    magazineModal.fadeIn(300);


    if (magazine.turn('is')) {
        magazine.turn('destroy');
    }
    

    magazine.empty();
    magazine.removeClass('animated zoom-in').css({
        display: '',
        opacity: '1',
        visibility: 'visible'
    });

  
    canvas.css({
        display: 'block',
        opacity: '1',
        visibility: 'visible'
    });


    setTimeout(function() {
        initializeFlipbook(config);
        loadThumbnails(styleId, config);
        
      
        magazine.show();
        canvas.show();
    }, 100);
}

function initializeFlipbook(config) { 
    const magazine = $('#genericMagazine'); 
    const viewport = magazine.closest('.magazine-viewport');


    magazine.show().css({
        opacity: 1,
        visibility: 'visible'
    });

 
    magazine.turn({
        width: config.width,
        height: config.height,
        duration: 1000,
        acceleration: true,
        gradients: true,
        autoCenter: true,
        elevation: 50,
        pages: config.pages,
        display: 'double',
        when: {
            turning: function(event, page, view) {
                if (typeof Hash !== 'undefined') {
                    Hash.go('page/' + page).update();
                }
                disableControls(page);
                $('.thumbnails li').removeClass('current');
                $('.thumbnails .page-' + page).parent().addClass('current');
            },
            turned: function(event, page, view) {
                disableControls(page);
                $(this).turn('center');
                if (page == 1) $(this).turn('peel', 'br');
            },
            missing: function (event, pages) {
                for (var i = 0; i < pages.length; i++)
                    addPage(pages[i], $(this), config.folder);
            },
            start: function(event, pageObject, corner) {
                $(this).show();
            }
        }
    });

 
    if (viewport.data('zoom')) {
        try { viewport.zoom('destroy'); } catch(e) { console.log('清除舊 zoom 實例'); }
    }

   
    viewport.zoom({
        flipbook: magazine,
        max: function() { return largeMagazineWidth() / magazine.width(); },
        when: {
            swipeLeft: function() { $(this).zoom('flipbook').turn('next'); },
            swipeRight: function() { $(this).zoom('flipbook').turn('previous'); },
            resize: function(event, scale, page, pageElement) {
                if (scale == 1)
                    loadSmallPage(page, pageElement, config.folder);
                else
                    loadLargePage(page, pageElement, config.folder);
            },
            zoomIn: function () {
                $('.thumbnails').hide();
                $('.magazine').removeClass('animated').addClass('zoom-in');
                $('#closeMagazine').hide(); 
                
            },
            zoomOut: function () {
                $('.thumbnails').fadeIn();
                $('#closeMagazine').show();
               
                setTimeout(function(){
                    $('.magazine').addClass('animated').removeClass('zoom-in');
                    resizeViewport();
                }, 0);
            }
        }
    });

    // 
    resizeViewport();

    // 
    setTimeout(function() { magazine.addClass('animated'); }, 100);

    // 
    // 
    magazine.find('.next-button').remove();
    magazine.find('.previous-button').remove();

    const nextButton = $('<div class="next-button"></div>');
    const prevButton = $('<div class="previous-button"></div>');

    magazine.append(nextButton);
    magazine.append(prevButton);

    nextButton.on('click', function() { magazine.turn('next'); });
    prevButton.on('click', function() { magazine.turn('previous'); });

    //
    disableControls(1);

    //
    // 
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    const DRAG_THRESHOLD = 5;

   
    magazine.off('.zoomToggle');

    magazine.on('mousedown.zoomToggle', function(e) {
      
        if (e.button === 0) {
            startX = e.pageX;
            startY = e.pageY;
            isDragging = false; 
        }
    });

   
    magazine.on('mousemove.zoomToggle', function(e) {
       
        if (e.buttons & 1 && !isDragging && (Math.abs(e.pageX - startX) > DRAG_THRESHOLD || Math.abs(e.pageY - startY) > DRAG_THRESHOLD)) {
            isDragging = true;
        }
    });

    
    magazine.on('mouseup.zoomToggle', function(e) {
       
        if (e.button !== 0) {
            return;
        }

       
        if ($(e.target).hasClass('next-button') || $(e.target).hasClass('previous-button')) {
            return;
        }

       
        if (isDragging) {
            isDragging = false; 
            return;
        }

        
        const currentZoom = viewport.zoom('value');
        if (currentZoom == 1) {
           
            const viewportOffset = viewport.offset();
            const x = e.pageX - viewportOffset.left;
            const y = e.pageY - viewportOffset.top;
            viewport.zoom('zoomIn', {x: x, y: y});
        } else {
           
            viewport.zoom('zoomOut');
        }
    });

    console.log('Flipbook 初始化完成, 頁數:', config.pages);
}


function closeMagazineModal() {
    const magazine = $('#genericMagazine');
    const magazineModal = $('#magazineModal');
    
  
    $('.thumbnails').hide();
    
  
    const viewport = magazine.closest('.magazine-viewport');
    if (viewport.zoom && viewport.zoom('value') > 1) {
        viewport.zoom('zoomOut');
    }
    

    magazineModal.fadeOut(300, function() {
      
        if (magazine.turn('is')) {
            magazine.turn('destroy');
        }
        
       
        magazine.empty();
        magazine.removeClass('animated zoom-in');
        magazine.css({
            display: '',
            opacity: '',
            visibility: ''
        });
        
       
        if (viewport.data('zoom')) {
            viewport.removeData('zoom');
        }
       
        magazine.off('.zoomToggle');
        
        
        $('#closeMagazine').show();
    });
}


function addPage(page, book, folder) {
    var element = $('<div />', {});

    if (book.turn('addPage', element, page)) {
        element.html('<div class="gradient"></div><div class="loader"></div>');
        loadPage(page, element, folder);
    }
}

function loadPage(page, pageElement, folder) {
    var img = $('<img />');

    img.on('mousedown', function(e) { e.preventDefault(); });
    img.on('load', function() {
        $(this).css({width: '100%', height: '100%'});
        $(this).appendTo(pageElement);
        pageElement.find('.loader').remove();
    });
    
   
    img.on('error', function() {
        console.error('無法載入圖片:', folder + page + '.jpg');
        pageElement.find('.loader').html('圖片載入失敗');
    });

    img.attr('src', folder + page + '.jpg');
    loadRegions(page, pageElement, folder);
}

function loadLargePage(page, pageElement, folder) {
    var img = $('<img />');
    img.on('load', function() {
        var prevImg = pageElement.find('img');
        $(this).css({width: '100%', height: '100%'});
        $(this).appendTo(pageElement);
        prevImg.remove();
    });
    img.attr('src', folder + page + '-large.jpg');
}

function loadSmallPage(page, pageElement, folder) {
    var img = pageElement.find('img');
    img.css({width: '100%', height: '100%'});
    img.off('load');
    img.attr('src', folder + page + '.jpg');
}

function loadRegions(page, element, folder) {
    $.getJSON(folder + page + '-regions.json')
        .done(function(data) {
            $.each(data, function(key, region) {
                addRegion(region, element);
            });
        })
        .fail(function() {
            console.log('沒有找到區域定義文件:', folder + page + '-regions.json');
        });
}

function addRegion(region, pageElement) {
    var reg = $('<div />', {'class': 'region ' + region.cssClass});
    reg.css({
        top: region.y,
        left: region.x,
        width: region.width,
        height: region.height
    });
    reg.attr('region-data', $.param(region.data || ''));
    pageElement.append(reg);
}


function loadThumbnails(styleId, config) {
    const ul = $('#genericThumbnails').empty();
    const numPages = config.pages;
    const folder = config.folder;

    console.log('開始載入縮圖，共', numPages, '頁');

  
    if (numPages >= 1) {
        
        ul.append(`<li><img src="${folder}1.jpg" width="76" height="100" class="page-1"><span>1</span></li>`);
    }

    
    for (let i = 2; i < numPages; i += 2) {
        const page1 = i;
        const page2 = i + 1;

        let liContent = `<li>`;
        liContent += `<img src="${folder}${page1}.jpg" width="76" height="100" class="page-${page1}">`;

        if (page2 < numPages) {
            liContent += `<img src="${folder}${page2}.jpg" width="76" height="100" class="page-${page2}">`;
            liContent += `<span>${page1}-${page2}</span>`;
        } else {
            liContent += `<span>${page1}</span>`;
        }
        liContent += `</li>`;
        ul.append(liContent);
    }

    
    if (numPages > 1) {
        ul.append(`<li><img src="${folder}${numPages}.jpg" width="76" height="100" class="page-${numPages}"><span>${numPages}</span></li>`);
    }
    
    $('.thumbnails .page-1').parent().addClass('current');
    

    $('.thumbnails').show();
    console.log('縮圖載入完成');
}



function disableControls(page) {
    const magazine = $('#genericMagazine');
    const totalPages = magazine.turn('pages');
    const viewport = magazine.closest('.magazine-viewport');

    if (page == 1) viewport.find('.previous-button').hide();
    else viewport.find('.previous-button').show();
                      
    if (page == totalPages) viewport.find('.next-button').hide();
    else viewport.find('.next-button').show();
}

function largeMagazineWidth() {
    return 2214;
}

function calculateBound(d) {
    var bound = {width: d.width, height: d.height};
    
    if (bound.width > d.boundWidth || bound.height > d.boundHeight) {
        var rel = bound.width / bound.height;
        
        if (d.boundWidth / rel > d.boundHeight && d.boundHeight * rel <= d.boundWidth) {
            bound.width = Math.round(d.boundHeight * rel);
            bound.height = d.boundHeight;
        } else {
            bound.width = d.boundWidth;
            bound.height = Math.round(d.boundWidth / rel);
        }
    }
    
    return bound;
}

function resizeViewport() {
    if ($('#magazineModal').is(':hidden')) return;

    const width = $(window).width();
    const height = $(window).height();
    const magazine = $('#genericMagazine');
    const viewport = magazine.closest('.magazine-viewport');
    
    if (!magazine.turn('is')) return;

    const options = magazine.turn('options');

    magazine.removeClass('animated');

    viewport.css({ width: width, height: height }).zoom('resize');

    if (magazine.turn('zoom') == 1) {
        const bound = calculateBound({
            width: options.width,
            height: options.height,
            boundWidth: Math.min(options.width, width * 0.9),
            boundHeight: Math.min(options.height, height * 0.9)
        });

        if (bound.width % 2 !== 0) bound.width -= 1;

        if (bound.width != magazine.width() || bound.height != magazine.height()) {
            magazine.turn('size', bound.width, bound.height);

            
        }

        magazine.css({ top: -bound.height / 2, left: -bound.width / 2 });
    }

    magazine.addClass('animated');
}



function loadApp() {
    console.log('loadApp 開始執行');
    
   
    $('.magazine-trigger').on('click', function() {
        const styleId = $(this).data('style-id');
        console.log('點擊了風格:', styleId);
        openMagazineModal(styleId);
    });

    
    $('#closeMagazine').on('click', closeMagazineModal);
    
    
    $(document).on('keydown', function(e) {
        if ($('#magazineModal').is(':hidden')) return;

        const magazine = $('#genericMagazine');
        const viewport = magazine.closest('.magazine-viewport');
        var previous = 37, next = 39, esc = 27;

        switch (e.keyCode) {
            case previous: magazine.turn('previous'); e.preventDefault(); break;
            case next: magazine.turn('next'); e.preventDefault(); break;
            case esc: viewport.zoom('zoomOut'); e.preventDefault(); break; 
        }
    });
    
    // 
    $(window).on('resize orientationchange', resizeViewport);

    // URL hash 
    if (typeof Hash !== 'undefined') {
        Hash.on('^page\/([0-9]*)$', {
            yep: function(path, parts) {
                var page = parts[1];
                if (page !== undefined && $('#genericMagazine').turn('is')) {
                    $('#genericMagazine').turn('page', page);
                }
            },
            nop: function(path) {
                if ($('#genericMagazine').turn('is')) {
                    $('#genericMagazine').turn('page', 1);
                }
            }
        });
    }

    
    $(document).on('click', '.thumbnails img', function() {
        const classes = $(this).attr('class').split(' ');
        const pageClass = classes.find(c => c.startsWith('page-'));
        if (!pageClass) return;

        const pageNum = parseInt(pageClass.replace('page-', ''));
        const magazine = $('#genericMagazine');

        if (magazine.turn('is')) {
            magazine.turn('page', pageNum);
        }
    });
    
    console.log('loadApp 完成');
}
