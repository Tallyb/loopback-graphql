'use strict';

module.exports = function(Note) {

    Note.clear = () => {
        return {
            note: {
                Content: ''
            },
            previousClear: new Date()
        };
    };

    Note.remoteMethod(
        'clear', {
            'http': {
                'path': '/clear',
                'verb': 'post'
            },
            'returns': [{
                'arg': 'note',
                'type': 'object'
            }, {
                'arg': 'previousClear',
                'type': 'Date'
            }]
        });
};