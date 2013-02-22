var Board = {};

Board.init = function () {
    Board.get_leaderboard();
    Board.startUpdate(6000);
    Board.setUpdatedTime();
    $('.toggle-update').click(Board.toggleUpdate);
}

Board.setUpdatedTime = function () {
    $('.updated-time').text(new Date().toLocaleString());
}

Board.toggleUpdate = function () {
    if($('.toggle-update').hasClass('started')) {
        Board.stopUpdate();
    } else {
        Board.startUpdate();
    }
}

Board.stopUpdate = function () {
    console.log('stop update');
    $('.toggle-update').removeClass('started').text('Start update');
    clearInterval(Board.timeInterval);
    Board.timeInterval = null;
}

Board.startUpdate = function (time) {
    time = time || 5000;
    console.log('start update');
    $('.toggle-update').addClass('started').text('Stop update')
    Board.timeInterval = setInterval(Board.get_leaderboard, time);
}

Board.updateTable = function (records) {
    if(records.length == 0) {
        console.log('No records found');
        return false;
    }
    var new_records = [];
    for (var i in records) {
        var tr = $('<tr><td></td><td></td><td></td><td class="browser hidden-phone"></td><td class="device hidden-phone"><button class="delete close">&times;</button></td></tr>');
        var td = tr.find('td');
        td.eq(0).append(parseInt(i) + 1);
        td.eq(1).append(records[i].username);
        td.eq(2).append(records[i].score);
        td.eq(3).append(['<img src="assets/img/browser/', records[i].device.browser_icon, '" title="', records[i].user_agent, '"> ', records[i].device.browser ].join('') );
        td.eq(4).append(['<img src="assets/img/device/', records[i].device.device_icon, '" title="', records[i].device.brand, '">' ].join('') );
        td.eq(4).find('.delete').attr('data-record-id', records[i].id).click(function () {
            var id = $(this).data('record-id');
            $(this).closest('tr').fadeOut(1000);
            Board.deleteRecord(id);
        });
        new_records.push(tr);
    };
    $('.leaderboard tbody').html(new_records);
    Board.setUpdatedTime();
}
Board.get_leaderboard = function () {
    $('.loading').show();
    $.get('records', function(records) {
        Board.updateTable(records);
        $('.loading').fadeOut(1000);
    });
}

Board.deleteRecord = function (id) {
    $.ajax({
        url: 'records/' + id,
        type: 'delete',
        success: function(data) {
            console.log('data', data);
        }
    });
}

$(Board.init);