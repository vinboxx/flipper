var Deck = {
    // cards: ['apple','basecamp','delicious','digg','firefox','flickr','gmail','ie','itunes','mint','opera','rss','skype','stumbleupon','twitter'],
    cards: ['apple','basecamp','delicious','digg','firefox','flickr','gmail','ie','itunes','mint'],
    viewport: {
      width: $(window).width(),
      height: $(window).height()
    },
    isTouchDevice: 'ontouchstart' in document.documentElement,
    itemsPosition: [],
    zoom: false,
    itemGap: 1,
    recordId: 0
};

Deck.init = function () {
    Deck.flipContainer = $('.flip-container');
    Deck.restart();

    if(!Deck.username) {
        $(window).load(Deck.showUserForm);
    }

    $('.restart').click(Deck.restart);
}

Deck.showUserForm = function () {
    var ans = prompt("Please enter your name","");
    if(ans) {
        Deck.username = ans;
    } else {
        Deck.username = 'Anonymous_' + parseInt(Deck.getCurrentTime()/1000);
    }
}

Deck.restart = function () {
    // Reset state
    Deck.state = 'ready';
    Deck.watchingCards = [];
    Deck.matchedCards = 0;

    // Reset score
    Deck.score = 0;
    Deck.updateScore();
    Deck.recordId = 0;

    //Reset click
    Deck.totalClicks = 0;
    Deck.updateClicks();

    // Reset time
    Deck.startTime = 0;
    Deck.setTime('00:00:00');
    if(Deck.timeInterval) {
        clearInterval(Deck.timeInterval);
    }

    // Add cards
    Deck.flipContainer.empty();
    Deck.generateCards();
    Deck.positionFlipper();

    // Bind card event
    var eventName = Deck.isTouchDevice ? 'touchend' : 'click';
    Deck.flipper.on(eventName, Deck.openCard);

    // On resize event
    Deck.onResize(Deck.positionFlipper)();
}

Deck.onResize = function (c, t) {
    // https://github.com/louisremi/jquery-smartresize
    onresize=function(){clearTimeout(t);t=setTimeout(c,100)};return c
}

Deck.shuffle = function (cards) {
    for(var j, x, i = cards.length; i; j = parseInt(Math.random() * i), x = cards[--i], cards[i] = cards[j], cards[j] = x);
    return cards;
}

Deck.generateCards = function () {
    var cards = Deck.cards.concat(Deck.cards);
    cards = Deck.shuffle(cards);

    $.each(cards, function (index, value) {
      var img = $('<img>').attr('src', 'assets/img/' + value + '.png');
      var card = $('#card-template .flipper').clone();
      card.find('.back .label').html(img);
      Deck.flipContainer.append(card);
    });

    Deck.flipper = Deck.flipContainer.find('.flipper');
    Deck.totalItems = Deck.flipper.length;
    Deck.openClassName = Deck.zoom ? 'flipped' : 'opened';
}

Deck.positionFlipper = function () {
    // Get viewport size
    Deck.viewport = {
      width: $(window).width(),
      height: $(window).height()
    };

    // Get card size
    Deck.itemWidth = Deck.flipper.innerWidth();
    Deck.itemHeight = Deck.flipper.innerHeight();

    // Reset position
    Deck.itemsPosition = [];

    // Close open card
    // Deck.flipper.removeClass(Deck.openClassName);

    // Calculate columns and rows
    var columns = Math.floor(Deck.viewport.width / (Deck.itemWidth + Deck.itemGap)),
        rows = Math.ceil(Deck.totalItems / columns);

    if(columns > Deck.totalItems) {
        columns = Deck.totalItems;
    }

    // Set container size
    Deck.flipContainer.css({
      width: (columns * (Deck.itemWidth + Deck.itemGap)) - Deck.itemGap,
      height: (rows * (Deck.itemHeight + Deck.itemGap)) - Deck.itemGap
    });

    // Calculate card position
    var posX = 0, posY = 0, i = 0;
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < columns; c++) {
            posX = (c * (Deck.itemWidth + Deck.itemGap));
            posY = (r * (Deck.itemHeight + Deck.itemGap));

            Deck.setTransform(Deck.flipper.eq(i), posX, posY);
            Deck.itemsPosition.push({
                posX: posX,
                posY: posY
            });
            i++;
        };
    };
}

Deck.getCurrentTime = function () {
    return new Date().getTime();
}

Deck.getPlayTime = function () {
    return Deck.startTime ? Math.floor(Deck.getCurrentTime() - Deck.startTime) : 0;
}

Deck.setTime = function (time) {
    $('.time').text(time);
}

Deck.updateScore = function () {
    $('.current-score').text(Deck.score);
    if(!Deck.score) {
        return false;
    }
    $.ajax({
        url: Deck.recordId ? 'records/' + Deck.recordId : 'records',
        type: Deck.recordId ? 'put' : 'post',
        data: {
            score: Deck.score,
            username: Deck.username
        },
        success: function(data) {
            // console.log('data', data);
            if(data.id) {
                Deck.recordId = data.id;
            }
        }
    });
}

Deck.updateClicks = function () {
    $('.current-click').text(Deck.totalClicks);
}

Deck.openCard = function() {
    var card = $(this);

    if (card.hasClass(Deck.openClassName)) {
        return false;
    }

    if(Deck.state !== 'ready') {
        // console.log('can not open new card', Deck.state);
        return false;
    }

    Deck.totalClicks += 1;
    Deck.updateClicks()
    
    var index = card.index();
    Deck.watchingCards.push(index);
    // console.log('Deck.watchingCards', Deck.watchingCards);

    if(Deck.watchingCards.length == 3) {
        // console.log('Warning: Opened', Deck.watchingCards.length);
        Deck.watchingCards.pop();
        return false;
    }

    if(!Deck.startTime) {
        Deck.gameStart();
    }

    if(Deck.zoom) {
      var posX = (Deck.flipContainer.innerWidth()/2) - card.innerWidth();
      var posY = (Deck.viewport.height/2) - card.innerHeight();
      Deck.setTransform(this, posX, posY);
    }
    // console.log('open', index);
    card.addClass(Deck.openClassName);
    
    if(Deck.watchingCards.length == 2) {
        // console.log('check match');
        Deck.checkMatch();
    }
}

Deck.gameStart = function () {
    Deck.startTime = Deck.getCurrentTime();
    Deck.timeInterval = setInterval(function(){
        var totalSec = parseInt(Deck.getPlayTime() / 1000);
        var hours = parseInt( totalSec / 3600 ) % 24;
        var minutes = parseInt( totalSec / 60 ) % 60;
        var seconds = parseInt(totalSec % 60);

        var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);

        Deck.setTime(result);
    },1000);
}

Deck.gameEnd = function () {
    clearInterval(Deck.timeInterval);
    Deck.state = 'game-end'
}

Deck.closeCard = function(index, callback) {
    // console.log('close card', index);
    Deck.flipper.eq(index).removeClass(Deck.openClassName);
    if(typeof(callback) == 'function') {
        callback();
    }
}

Deck.checkMatch = function () {

    Deck.state = 'check-match';
    var one = Deck.flipper.eq(Deck.watchingCards[0]).find('img').attr('src');
    var two = Deck.flipper.eq(Deck.watchingCards[1]).find('img').attr('src');

    if(one === two) {
        Deck.matchedCards += 2;
        Deck.addScore();
        Deck.state = 'ready';
        Deck.watchingCards = [];
    } else {
        Deck.closeWatchingCards();
    }

    if(Deck.matchedCards == Deck.totalItems) {
        Deck.gameEnd();
    }
}

Deck.closeWatchingCards = function () {
    Deck.state = 'closing-cards';
    // console.log('not match', Deck.watchingCards[0], Deck.watchingCards[1]);
    var lastCardIndex = Deck.watchingCards[Deck.watchingCards.length-1];
    var eventName = 'transitionend.closing webkitTransitionEnd.closing oTransitionEnd.closing otransitionend.closing MSTransitionEnd.closing';
    Deck.flipper.eq(lastCardIndex).one(eventName, function() {
        // console.log('transition end card index', lastCardIndex);
        // console.log('closeWatchingCards', Deck.watchingCards.length);
        $.each(Deck.watchingCards, function (index, value) {
            Deck.closeCard(value, function () {
                Deck.watchingCards = [];
                Deck.watchingCards.splice(index,1);
            });
        });
        $(this).unbind(eventName);
        Deck.state = 'ready';
    });
}

Deck.addScore = function () {
    var baseScore = 10000;
    var time_bonus = 5000/(Deck.getPlayTime()/1000);
    var click_bonus = 5000/Deck.totalClicks;
    // console.log('time_bonus', time_bonus);
    // console.log('click_bonus', click_bonus);
    Deck.score += parseInt(baseScore + time_bonus + click_bonus);
    Deck.updateScore();
}

Deck.setTransform = function (el, x, y) {
    $(el).css({
        webkitTransform: 'translate3d(' + x +'px,' + y + 'px,0)',
        MozTransform: 'translate3d(' + x +'px,' + y + 'px,0)',
        msTransform: 'translate3d(' + x +'px,' + y + 'px,0)',
        OTransform: 'translate3d(' + x +'px,' + y + 'px,0)',
        transform: 'translate3d(' + x +'px,' + y + 'px,0)'
    });
}

$(Deck.init);