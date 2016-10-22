'use strict';

module.exports = function (Author) {

    Author.remoteMethod(
        'addFriend', {
            'http': {
                'path': '/addFriend',
                'verb': 'post'

            },

            'accepts': [
                {
                    'arg': 'author',
                    'type': 'number'
                },{
                    'arg': 'friend',
                    'type': 'number'
                }
            ],

            'returns': {
                'arg': 'result',
                'type': 'object'

            }
        }
);

    Author.addFriend = function (author, friend) {

        return Author.findById(author)
            .then(res => {
                let updated = res;
                updated.friendIds.push(friend);
                console.log(updated);
                return updated.save();
            }).then(res => {
                console.log('AFTER UPDATE', res);
            });
    };
};