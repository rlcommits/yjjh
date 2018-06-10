// ==UserScript==
// @name         遇见江湖常用工具集
// @namespace    http://tampermonkey.net/
// @version      2.1.13
// @description  just to make the game eaiser!
// @author       RL
// @include      http://sword-direct*.yytou.cn*
// @run-at       document-idle
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

window.setTimeout(function () {
    class Job {
        constructor (id, interval, startEvent) {
            this._id = id;
            this._interval = interval;
            this._startEvent = startEvent;
        }

        start () {
            this._handler = setInterval(this._startEvent, this._interval);
            log(`Starting job ${this._id} (handler= ${this._handler})...`);
        }

        stop () {
            log(`Job ${this._id} (handler= ${this._handler}) stopped.`);
            clearInterval(this._handler);
        }

        getId () {
            return this._id;
        }

        getInterval () {
            return this._interval;
        }
    }

    var JobManager = {
        _jobs: [],

        register (id, interval, startEvent) {
            this._jobs.push(new Job(id, interval, startEvent));
        },

        getJob (id) {
            return this._jobs.filter(v => v.getId() === id)[0];
        }
    };

    var System = {
        globalObjectMap: window.unsafeWindow.g_obj_map,
        debugMode: false,

        replaceControlCharBlank (valueWithColor) {
            return window.unsafeWindow.g_simul_efun.replaceControlCharBlank(valueWithColor);
        }
    };

    var User = {
        _areaRange: '',

        async initialize () {
            await ButtonManager.click('skills;team;friend;score;#4 prev');

            User._areaRange = analyseAreaRange(User.getArea());

            await analyseEnforce();

            async function analyseEnforce () {
                if (parseInt(System.globalObjectMap.get('msg_attrs').get('force_factor'))) {
                    $('#id-enforce').text('取消加力');
                } else {
                    $('#id-enforce').text('恢复加力');
                    $('#id-enforce').css('color', 'red');
                }
            }

            function analyseAreaRange (area) {
                for (let start = 1, end = 5; start < 500; start += 5, end += 5) {
                    if (area >= start && area <= end) {
                        return start + '-' + end;
                    }
                }
            }
        },

        getNickName () {
            return System.globalObjectMap.get('msg_attrs').get('name');
        },

        getId () {
            return System.globalObjectMap.get('msg_attrs').get('id');
        },

        getArea () {
            return parseInt(System.globalObjectMap.get('msg_status').get('area'));
        },

        getAreaRange () {
            return User._areaRange;
        },

        attributes: {
            getMaxEnforce () {
                return parseInt(System.globalObjectMap.get('msg_score').get('max_enforce'));
            },

            getMaxKee () {
                return parseInt(System.globalObjectMap.get('msg_attrs').get('max_kee'));
            },

            getCurrentKee () {
                return parseInt(System.globalObjectMap.get('msg_attrs').get('kee'));
            },

            getCurrentForce () {
                return parseInt(System.globalObjectMap.get('msg_attrs').get('force'));
            },

            getMaxForce () {
                return parseInt(System.globalObjectMap.get('msg_attrs').get('max_force'));
            }
        },

        skills: {
            getSkillsEnabled (type = 'attack') {
                return System.globalObjectMap.get('msg_skills').elements.filter(function (v) {
                    if (!v['key'].includes('skill')) return false;
                    let info = Array.isArray(v['value']) ? v['value'] : v['value'].split(',');
                    return info[info.length - 3] === '1' && (!type || info[info.length - 4] === type);
                }).map(v => System.replaceControlCharBlank(v['value'].split(',')[1]));
            },

            getSkillsInUpgrading () {
                return System.globalObjectMap.get('msg_skills').elements.filter(function (v) {
                    let values = v['value'].split(',');
                    return values.length > 1 && (values[values.length - 1] === '4');
                }).map(v => System.replaceControlCharBlank(v['value'].split(',')[1]));
            },

            getSkillsInPractice () {
                return System.globalObjectMap.get('msg_skills').elements.filter(function (v) {
                    let values = v['value'].split(',');
                    return values.length > 1 && (values[values.length - 1] === '1');
                }).map(v => System.replaceControlCharBlank(v['value'].split(',')[1]));
            }
        }
    };

    var LeftoverChecker = {
        async fire () {
            let now = new Date();
            if (now.getHours() === 5 && now.getMinutes() === 55) {
                log('VIP 点点点自动触发：' + now.getHours() + '-' + now.getMinutes());

                await ButtonManager.click('#20 vip finish_bad 2');
                log('20 次正邪完毕。');

                await ButtonManager.click('#5 vip finish_taofan 2');
                log('5 次 逃犯完毕。');

                await ButtonManager.click('#5 vip finish_sort');
                log('5 次 打榜完毕。');

                await ButtonManager.click('#5 vip finish_task');
                log('5 次 普通谜题完毕。');

                await ButtonManager.click('#40 vip finish_clan');
                log('40 次 帮派任务完毕。');

                await ButtonManager.click('#20 vip finish_family');
                log('20 次 师门任务完毕。');

                await ButtonManager.click('sort fetch_reward');
                log('排行榜奖励领取完毕。');

                await ButtonManager.click('swords get_drop go');
                log('论剑奖励领取完毕。');

                await CreditTicketManager.fire();
                await DailyOneOffTaskHelper.fire();
            }
        }
    };

    var DailyWorksManager = {
        _works: [
            'public_op3',
            'work click maikuli',
            'work click duancha',
            'work click dalie',
            'work click baobiao',
            'work click maiyi',
            'work click xuncheng',
            'work click datufei',
            'work click dalei',
            'work click kangjijinbin',
            'work click zhidaodiying',
            'work click dantiaoqunmen',
            'work click shenshanxiulian',
            'work click jianmenlipai',
            'work click dubawulin',
            'work click youlijianghu'
        ].join(';'),

        async fire () {
            await ButtonManager.click(DailyWorksManager._works, 500);
            log('端茶倒水磕头完毕。');
        }
    };

    var CreditTicketManager = {
        async fire () {
            await Navigation.move('jh 1;e;n;#2 e;event_1_44731074;event_1_8041045;event_1_8041045;event_1_29721519');

            await ButtonManager.click('look_npc snow_fist_trainer', 500);
            $('.cmd_click2').filter(function () {
                return !$(this).text().match('观战|对话|比试|杀死|给予|学武|谜题卡|消费积分|狗年礼券');
            }).each(function () {
                ExecutionManager.execute($(this).attr('onclick'));
                log('雪亭镇李火狮：' + $(this).text() + '完毕。');
            });

            ExecutionManager.wait(500);
            await Navigation.move('home');
        }
    };

    var TianshanDailyHelper = {
        _stop: false,
        _monitor: 0,

        async start () {
            TianshanDailyHelper._stop = false;

            await Navigation.move('ne;nw;event_1_58460791');

            await retry();
            debugging('done');

            async function retry () {
                if (TianshanDailyHelper._stop) return true;

                await ExecutionManager.wait(1000);
                if (Objects.Room.getName() === '失足岩') {
                    debugging('right place');
                    await Navigation.move('nw;n;ne;nw;nw;w;#3 n;e;e;s');
                    await ButtonManager.click('give tianshan_hgdz');
                    await Objects.Npc.action(new Npc('护关弟子'), '对话', 3);
                    await Navigation.move('s;event_1_34855843');
                    ButtonManager.resetButtonById('id-tianshan-daily');

                    return true;
                } else {
                    debugging('wrong place, try again');
                    await Navigation.move('se;s;e;n;ne;nw;event_1_58460791');
                    return retry();
                }
            }
        },

        stop () {
            debugging('stopped manually');
            TianshanDailyHelper._stop = true;
        }
    };

    var WarriorIslandDailyHelper = {
        _stop: false,

        async start () {
            WarriorIslandDailyHelper._stop = false;

            await Navigation.move('jh 36;yell');
            await ExecutionManager.wait(25000);
            if (!WarriorIslandDailyHelper._stop) {
                await Navigation.move('e;#3 ne;#3 e;event_1_9179222;e;event_1_11720543;w;n;e;e;s;e;event_1_44025101');
            }

            await retry();
            debugging('done');

            async function retry () {
                if (WarriorIslandDailyHelper._stop) return true;

                await ExecutionManager.wait(1000);
                if ($('.cmd_click3').filter(function () { return $(this).text() === '进入甬道'; }).length) {
                    debugging('right place');
                    await ButtonManager.click('event_1_36230918;e;e;s;event_1_77496481');
                    ButtonManager.resetButtonById('id-warrior-island-daily');
                    return true;
                } else {
                    debugging('wrong place, try again');
                    await Navigation.move('event_1_4788477;nw;w;sw;w;#3 n;w;w;s;w;nw;w;e;#3 ne;#5 e;s;e;event_1_44025101');
                    return retry();
                }
            }
        },

        stop () {
            WarriorIslandDailyHelper._stop = true;
        }
    };

    class Debate {
        async prepare () {
            await ButtonManager.click('swords report go;swords select_member huashan_feng;swords select_member xiaoyao_tonglao;swords select_member wudang_zhang;swords fight_test go');
        }

        async start () {
            await ButtonManager.click('score');
            await ButtonManager.click('prev;enforce 0');

            await this.fight();

            await ButtonManager.click('enforce ' + User.attributes.getMaxEnforce());
        }

        async fight () {
            if (Panels.Notices.containsMessage('试剑胜利\\(5/5\\)！')) {
                ButtonManager.click('prev_combat;prev');
                return true;
            } else if (PerformHelper.readyToPerform(3)) {
                await PerformHelper.perform(User.skills.getSkillsEnabled('attack')[0]);
            } else if (CombatStatus.justFinished()) {
                ButtonManager.click('prev_combat;swords fight_test go');
            }

            await ExecutionManager.wait(2000);
            return this.fight();
        }
    }

    class Npc {
        constructor (name, id = '') {
            this._name = name;
            if (id) this._id = id;
        }

        setId (id) {
            this._id = id;
        }

        getId () {
            return this._id ? this._id : Objects.Npc.getIdByName(this._name);
        }

        getName () {
            return this._name;
        }

        toString () {
            return this._name + '/' + this._id;
        }
    }

    class Item {
        constructor (name, id = '', quantity = 1) {
            this._name = name;
            if (id) this._id = id;
            if (quantity) this._quantity = quantity;
        }

        setId (id) {
            this._id = id;
        }

        getId () {
            return this._id ? this._id : Objects.Item.getIdByName(this._name);
        }

        getName () {
            return this._name;
        }

        getQuantity () {
            return this._quantity;
        }

        setQuantity (quantity) {
            this._quantity = quantity;
        }

        toString () {
            return this._name + '/' + this._id;
        }
    }

    class Task {
        identifyPath (room, specificTarget) {
            this._room = room;

            if (PathManager.getPathForFightOrGet(this._room, specificTarget)) {
                this._path = PathManager.getPathForFightOrGet(this._room, specificTarget);
                this._type = GenericTaskManager.Types.FIGHT_OR_GET;
            } else if (PathManager.getPathForPurchase(this._room)) {
                this._path = PathManager.getPathForPurchase(this._room);
                this._type = GenericTaskManager.Types.PURCHASE;
            } else if (PathManager.getPathForItemsWithNpcBody(this._room)) {
                this._path = PathManager.getPathForItemsWithNpcBody(this._room);
                this._type = GenericTaskManager.Types.BODY;
            } else {
                debugging('failed to identify task type');
            }
        }

        getType () {
            return this._type;
        }

        getRoom () {
            return this._room;
        }

        getPath () {
            return this._path;
        }

        setNpc (npc) {
            this._npc = npc;
        }

        getNpc () {
            return this._npc;
        }

        setAction (action) {
            this._action = action;
        }

        getAction () {
            return this._action;
        }

        setItem (item) {
            this._item = item;
        }

        getItem () {
            return this._item;
        }

        toString () {
            let result = this._type + '/' + this._room + '/' + this._action + '/';
            if (this._npc) result += this._npc.getName();
            if (this._item) result += this._item.getName();

            return result;
        }
    }

    var GenericTaskManager = {
        _tasksNotSupported: [],

        Types: {
            FIGHT_OR_GET: 1,
            PURCHASE: 2,
            BODY: 3
        },

        async handleTask () {
            let task = GenericTaskManager.identifyTask();
            if (task.getPath()) {
                await Navigation.move(task.getPath());
            } else {
                GenericTaskManager._tasksNotSupported.push(task.toString());
                log('当前版本暂不支持此任务：' + task.toString());
            }

            await ExecutionManager.wait(500);

            switch (task.getType()) {
                case GenericTaskManager.Types.FIGHT_OR_GET:
                    if (task.getAction() === '捡起') {
                        return Objects.Item.action(task.getItem(), task.getAction());
                    } else {
                        let combat = new Combat();
                        combat.initialize(task.getNpc(), task.getAction());

                        return combat.fire();
                    }
                case GenericTaskManager.Types.PURCHASE:
                    await Objects.Npc.action(task.getNpc(), '购买');
                    await ExecutionManager.wait(500);

                    await $('span.out2:contains(' + task.getItem().getName() + ')').click();

                    await ExecutionManager.wait(500);

                    await $('.cmd_click2:contains(购买)').click();
                    await ExecutionManager.wait(2000);

                    return true;
                case GenericTaskManager.Types.BODY:
                    let combat = new Combat();
                    combat.initialize(task.getNpc(), '杀死');

                    await combat.fire();
                    await ButtonManager.click('prev_combat');
                    await ExecutionManager.wait(500);

                    let search = new BodySearch();
                    await search.identifyCandidates();
                    return search.fire();
                default:
                    return false;
            }
        },

        identifyTask () {
            let message = Panels.Notices.filterMessageObjectsByKeyword('任务所在地方好像是').last().text();
            debugging('message=' + message);
            let taskDescription = message.match('任务所在地方好像是：(.*?)你') || message.match('任务所在地方好像是：(.*?)');
            let task = new Task();

            generateAdditionalTask();

            let matches = message.match('你现在的任务是(杀|战胜)(.*?)。') || message.match('给我在.*?内(杀|战胜)(.*?)。');
            if (matches) {
                task.identifyPath(taskDescription[1], matches[2]);

                task.setAction(matches[1] === '杀' ? '杀死' : '比试');
                task.setNpc(new Npc(matches[2]));
            } else {
                let findings = message.match('给我在.*?内寻找(.*?)。') || message.match('你现在的任务是寻找(.*?)。');
                if (findings) {
                    task.identifyPath(taskDescription[1], findings[1]);
                    task.setItem(new Item(findings[1]));

                    if (PathManager.getPathForFightOrGet(task.getRoom(), task.getItem().getName())) {
                        task.setAction('捡起');
                    } else if (PathManager.getPathForItemsWithNpcBody(task.getRoom()) || PathManager.getPathForPurchase(task.getRoom())) {
                        let place = task.getRoom().split('-');
                        task.setNpc(new Npc(place[place.length - 1]));
                        debugging('identify npc name=' + place[place.length - 1]);

                        if (PathManager.getPathForItemsWithNpcBody(task.getRoom())) {
                            task.setAction('杀死');
                        } else if (PathManager.getPathForPurchase(task.getRoom())) {
                            task.setAction('购买');
                        }
                    } else {
                        debugging('failed to load path for task room: ' + task.getRoom());
                    }

                    debugging('identify type=' + task.getAction());
                }
            }

            debugging('task=' + task.toString());
            return task;

            function generateAdditionalTask () {
                let obj = Panels.Notices.filterMessageObjectsByKeyword('你今天已完成(.*?)个任务').last();
                if (obj.text()) {
                    let matches = obj.text().match('你今天已完成(.*?)个任务');
                    switch (matches[1]) {
                        case '24/25':
                            ButtonManager.click('vip finish_family');
                            break;
                        case '19/20':
                            ButtonManager.click('vip finish_clan');
                            break;
                        case '39/40':
                            ButtonManager.click('vip finish_clan');
                            break;
                        default:
                            debugging(matches[0]);
                    }
                }
            }
        }
    };

    var IdleChecker = {
        _lastRoom: '',

        async initialize () {
            await ButtonManager.click('golook_room');

            IdleChecker._lastRoom = Objects.Room.getName();
        },

        async fire () {
            await ButtonManager.click('golook_room');
            if (Objects.Room.getType() === 'family') return;

            let currentRoom = Objects.Room.getName();
            debugging('当前位置：' + currentRoom);
            if (!currentRoom) return;

            if (currentRoom !== IdleChecker._lastRoom) {
                debugging('上一次记录位置 ' + IdleChecker._lastRoom + ' 自动更新成 ' + currentRoom);
                IdleChecker._lastRoom = currentRoom;
            } else {
                log('检测到在外面发呆超过 ' + JobManager.getJob('id-idle-checker').getInterval() / (1000 * 60) + ' 分钟，安全起见自动打道回府。');
                ButtonManager.click('home;look_room');
            }
        }
    };

    var DailyOneOffTaskHelper = {
        _tasksDefined: [{
            index: 1,
            item: '微博微信非死不可分享',
            action: async function () {
                await ButtonManager.click('share_ok 1;share_ok 2;share_ok 3;share_ok 4;share_ok 5;share_ok 7');
            },
            todo: true
        }, {
            index: 2,
            item: '洛阳刘守财理财',
            action: async function () {
                await Navigation.move('jh 2;n;n;n;n;n;n;n;e;tzjh_lq');
            },
            todo: true
        }, {
            index: 3,
            item: '扬州黄掌柜签到',
            action: async function () {
                await Navigation.move('jh 5;#3 n;w;sign7');
            },
            todo: true
        }, {
            index: 4,
            item: '雪亭镇客栈逄义礼包',
            action: async function () {
                await ExecutionManager.wait(500);
                await Navigation.move('jh 1;look_npc snow_mercenary');
                $('.cmd_click2').filter(function () { return !$(this).text().match('观战|兑换礼包|1元礼包|对话|比试|给予|登录大礼'); }).each(async function () {
                    await ExecutionManager.asyncExecute($(this).attr('onclick'));
                });
                await Navigation.move('jh 5;n;n;e;look_npc yangzhou_yangzhou9');
            },
            todo: true
        }, {
            index: 5,
            item: '扬州小宝斋双儿礼包',
            action: async function () {
                await Navigation.move('jh 5;n;n;e;look_npc yangzhou_yangzhou9');
                $('.cmd_click2').filter(function () { return !$(this).text().match('观战|对话|比试|给予'); }).each(async function () {
                    await ExecutionManager.asyncExecute($(this).attr('onclick'));
                });
            },
            todo: true
        }, {
            index: 6,
            item: '采莲破阵喂鳄鱼挖矿',
            action: async function () {
                await Navigation.move('jh 2;#19 n;e;#3 n;w;event_1_31320275');
                await Navigation.move('jh 26;w;w;n;n;event_1_14435995;s;e;e;event_1_18075497');
                await Navigation.move('jh 37;n;e;e;nw;nw;w;n;e;n;#3 e;#3 ne;se;n;event_1_97487911');
                await Navigation.move('home');
            },
            todo: true
        }, {
            index: 7,
            item: '商城购买',
            action: async function () {
                await ButtonManager.click('shop money_buy shop1_N_10');
            },
            todo: true
        }, {
            index: 8,
            item: '帮派烧香 + 闯楼奖励',
            action: async function () {
                await ButtonManager.click('#20 clan incense yx');
                await ButtonManager.click('cangjian get_all;xueyin_shenbinggu unarmed get_all;xueyin_shenbinggu blade get_all;xueyin_shenbinggu throwing get_all');
            },
            todo: true
        }, {
            index: 9,
            item: 'vip 暴击谜题 + 副本扫荡一到四',
            action: async function () {
                await ButtonManager.click('vip drops;#10 vip finish_big_task;#10 vip finish_dig');
                await ButtonManager.click('#2 vip finish_fb dulongzhai;#2 vip finish_fb junying;#2 vip finish_fb beidou;#2 vip finish_fb youling');
            },
            todo: true
        }],

        _stop: false,

        initialize (range) {
            let matches = range.match(/([0-9]{1})-{0,1}([0-9]{0,1})/);
            if (!matches) return false;

            let start = parseInt(matches[1]);
            let end = matches[2] ? parseInt(matches[2]) : start;
            DailyOneOffTaskHelper._tasksDefined.forEach(function (v) {
                v['todo'] = (v['index'] >= start && v['index'] <= end);
            });

            return true;
        },

        getTaskDefined () {
            return DailyOneOffTaskHelper._tasksDefined;
        },

        getTaskListString (todoOnly = false, flagStatus = false) {
            let tasks = todoOnly ? DailyOneOffTaskHelper._tasksDefined.filter(v => v['todo']) : DailyOneOffTaskHelper._tasksDefined;

            return tasks.map(v => v['index'] + '. ' + v['item'] + ((flagStatus & v['completed']) ? ' (已执行) ' : '')).join('\n');
        },

        async fire () {
            DailyOneOffTaskHelper._stop = false;
            $('#id-escape').click();

            for (let i = 0; i < DailyOneOffTaskHelper._tasksDefined.length; i++) {
                if (DailyOneOffTaskHelper._stop) break;
                if (!DailyOneOffTaskHelper._tasksDefined[i]['todo']) continue;

                await DailyOneOffTaskHelper._tasksDefined[i]['action']();
                DailyOneOffTaskHelper._tasksDefined[i]['completed'] = true;
                log(DailyOneOffTaskHelper._tasksDefined[i]['item'] + '执行完毕。');
                await Navigation.move('home');
            }

            ButtonManager.resetButtonById('id-escape');
        },

        stop () {
            DailyOneOffTaskHelper._stop = true;
        }
    };

    class Knight {
        constructor (name) {
            this._name = name;
        }

        getName () {
            return this._name;
        }

        getProgress () {
            return this._progress;
        }

        setProgress (progress) {
            this._progress = progress;
        }

        getAvailability () {
            return this._availability;
        }

        setAvailability (availability) {
            this._availability = availability;
        }

        getTalked () {
            return this._talked;
        }

        setTalked (talked) {
            this._talked = talked;
        }
    }

    class CustomizedEvent {
        constructor (criterial, action) {
            this._criterial = criterial;
            this._action = action;
        }

        getCriterial () {
            return this._criterial;
        }

        getAction () {
            return this._action;
        }
    }

    class Gem {
        constructor (name, level) {
            this._name = name;
            this._level = level;
        }

        getName () {
            return this._name;
        }

        getLevel () {
            return this._level;
        }

        getNextLevel () {
            return GemHelper.getNextLevel(this._level);
        }

        equals (gem) {
            return this._name === gem.getName() && this._level === gem.getLevel();
        }

        toString () {
            return !this._level ? this._name : this._level + '的' + this._name;
        }
    }

    class GemsPack {
        constructor (gems = []) {
            if (!Array.isArray(gems)) gems = [gems];

            this._gems = gems;
        }

        addGems (gems = []) {
            if (!Array.isArray(gems)) gems = [gems];

            this._gems = this._gems.concat(gems);
        }

        removeGems (gems = []) {
            if (!Array.isArray(gems)) gems = [gems];

            for (let i = 0; i < gems.length; i++) {
                let index = this._gems.findIndex(v => v.equals(gems[i]));
                this._gems.splice(index, 1);
            }
        }

        getGems (name = '', level = null) {
            return !name ? this._gems : this._gems.filter(v => v.getName() === name && (level === null || v.getLevel() === level));
        }

        estimateMerge (name = '', level = null) {
            if (GemHelper.cannotMerge(level)) return 0;

            let gem = new Gem(name, level);
            let gems = this._gems.filter(v => v.equals(gem));
            if (gems.length < 3) return this.estimateMerge(name, gem.getNextLevel());

            let mergeTimes = parseInt(gems.length / 3);
            this.removeGems(GemHelper.cloneGems(gem, mergeTimes * 3));
            let newGems = GemHelper.cloneGems(new Gem(name, gem.getNextLevel()), mergeTimes);
            this.addGems(newGems);

            return mergeTimes + this.estimateMerge(name, gem.getNextLevel());
        }

        toString (name = '', level = null) {
            let result = [];
            let gems = this.getGems(name, level);
            for (let i = 0; i < gems.length; i++) {
                result.push(gems.toString());
            }
            return result;
        }
    }

    var GemHelper = {
        _gemLevels: ['碎裂', '裂开', '', '无暇', '完美'],
        _gemsPack: new GemsPack(),

        getNextLevel (level) {
            return GemHelper._gemLevels[GemHelper._gemLevels.findIndex(v => v === level) + 1];
        },

        cannotMerge (level) {
            return GemHelper._gemLevels.findIndex(v => v === level) < 0 || level === GemHelper._gemLevels[GemHelper._gemLevels.length - 1];
        },

        cloneGems (gem, cloneTimes) {
            let result = [];
            for (let i = 0; i < cloneTimes; i++) {
                result.push(gem);
            }
            return result;
        },

        async countGems () {
            await ButtonManager.click('items');
            let elements = $('tr').filter(function () {
                return $(this).attr('onclick') && $(this).attr('onclick').match('items info .*?baoshi|items info .*?zishuijing');
            });

            GemHelper._gemsPack = buildGemsPack(buildList(elements, 'span.out4_auto'), buildList(elements, 'span.out3'));

            function buildGemsPack (names, quantities) {
                let result = [];
                for (let i = 0; i < names.length; i++) {
                    let quantity = parseInt(quantities[i].replace('颗', ''));
                    for (let j = 0; j < quantity; j++) {
                        result.push(names[i].includes('的') ? new Gem(names[i].split('的')[1], names[i].split('的')[0]) : new Gem(names[i], ''));
                    }
                }
                return new GemsPack(result);
            }

            function buildList (elements, clazz) {
                let result = [];
                elements.find(clazz).each(function () {
                    result.push($(this).text());
                });
                return result;
            }
        },

        getGemsPack () {
            return GemHelper._gemsPack;
        },

        getGemListString (name) {
            let message = '';
            GemHelper._gemLevels.forEach(function (v) {
                message += GemHelper.groupGems(name, v);
            });
            return message;
        },

        groupGems (name, level) {
            let gems = GemHelper._gemsPack.getGems(name, level);
            return !gems.length ? '' : (level || '普通') + '(' + gems.length + ') ';
        },

        confirmGemName () {
            let question = '要合成背包里哪种宝石？\n';
            for (let i = 0; i < GemHelper._gemNames.length; i++) {
                question += '\n' + (i + 1) + '. ' + GemHelper._gemNames[i] + ': ' + GemHelper.getGemListString(GemHelper._gemNames[i]);
            }

            return parseInt(window.prompt(question + '\n\n输入数字序号即可。', 1));
        },

        _gemNames: ['紫宝石', '蓝宝石', '红宝石', '绿宝石', '黄宝石'],
        confirmMerge (name) {
            let message = `合成前：\n${name} - ` + GemHelper.getGemListString(name);
            let times = GemHelper._gemsPack.estimateMerge(name, '碎裂');
            message += `\n\n合成后：\n${name} - ` + GemHelper.getGemListString(name);

            return window.confirm(message + '\n\n总共合成 ' + times + ' 次，花费白银 ' + times * 5 + ' 万两');
        },

        _gemIds: ['zishuijing', 'lanbaoshi', 'hongbaoshi', 'lvbaoshi', 'huangbaoshi'],
        async mergeGems (name) {
            let id = GemHelper._gemIds[GemHelper._gemNames.findIndex(v => v === name)];
            debugging('gem id=' + id);

            for (let i = 0; i < GemHelper._gemLevels.length - 1; i++) {
                await ButtonManager.click('items info ' + id + (i + 1));
                await ExecutionManager.wait(500);

                let element = $('span.out3').filter(function () { return $(this).text().match('数量'); });
                if (!element.length) continue;

                let quantity = parseInt(element.text().match('数量(.*)')[1]);
                debugging('quantity=' + quantity);

                let timesToMerge = parseInt(quantity / 3);
                await ButtonManager.click('#' + timesToMerge + ' items hecheng ' + id + (i + 1) + '_N_1');
            }

            await ButtonManager.click('prev');
        }
    };

    var BackpackCleaner = {
        _itemsToSell: [
            '天寒手镯', '天寒戒', '天寒项链',
            '钢剑', '长剑', '单刀', '竹剑', '匕首', '鬼头刀', '长鞭', '木棍', '逆钩匕', '羊角匕', '木刀', '木叉', '木锤', '金刚杖',
            '铁戒', '竹刀', '钢刀', '七星剑', '竹鞭', '木剑', '长枪', '牧羊鞭', '白棋子', '禅杖', '斩空刀', '木枪', '新月棍', '金弹子',
            '破披风', '牛皮带', '麻带', '长斗篷', '丝质披风', '锦缎腰带', '青布袍', '牛皮靴', '梅花匕', '八角锤', '阿拉伯弯刀',
            '木盾', '铁盾', '藤甲盾', '青铜盾', '水烟阁司事帽', '水烟阁司事褂', '水烟阁武士氅', '鲜红锦衣', '鲜红金乌冠',
            '鞶革', '软甲衣', '铁甲', '蓑衣', '布衣', '军袍', '银丝甲', '天寒帽', '重甲',
            '鹿皮小靴', '纱裙', '绣花小鞋', '细剑', '柴刀', '精铁甲', '白蟒鞭', '草鞋', '草帽', '羊毛裙',
            '树枝', '鲤鱼', '鲫鱼', '破烂衣服', '水草', '兔肉', '白色长袍', '草莓', '闪避基础', '水密桃', '菠菜粉条', '大光明经',
            '莲蓬',
            '道德经', '古铜缎子袄裙', '彩巾', '彩衣', '拐杖', '银戒', '彩靴', '彩帽', '彩带', '彩镯', '黑色棋子', '白色棋子', '黑袍', '白袍',
            '水蜜桃', '木戟', '桃符纸', '铁斧', '硫磺', '鸡叫草', '木钩', '玉蜂浆', '天山雪莲', '鹿皮手套', '飞镖', '铁项链', '刀法基础', '蛋糕',
            '废药渣', '废焦丹'
        ],

        _itemsToSplit: [
            '虎皮腰带', '羊毛斗篷', '金丝甲', '红光匕', '沧海护腰', '金丝宝甲衣', '玄武盾', '星河剑',
            '夜行披风', '破军盾', '玉清棍', '残雪帽', '残雪手镯', '残雪鞋', '貂皮斗篷', '宝玉甲', '生死符',
            '血屠刀', '残雪项链', '天寒鞋', '天寒匕'
        ],

        async sell (items = []) {
            for (let i = 0; i < items.length; i++) {
                await sellSpecificItem(items[i]);
            }

            async function sellSpecificItem (item = new Item()) {
                let numberInBatch = item.getQuantity() >= 100 ? 100 : (item.getQuantity() >= 50 ? 50 : (item.getQuantity() >= 10 ? 10 : 0));
                if (numberInBatch) {
                    await ButtonManager.click(`items sell ${item.getId()}_N_${numberInBatch}`);
                    log(`${item.getName()} 已卖，数量 ${numberInBatch}`);
                    item.setQuantity(item.getQuantity() - numberInBatch);

                    await sellSpecificItem(item);
                } else if (item.getQuantity()) {
                    await ButtonManager.click(`#${item.getQuantity()} items sell ${item.getId()}`);
                    log(`${item.getName()} 已卖，数量 ${item.getQuantity()}`);
                }
            }
        },

        getItemsToSell () {
            return Panels.Backpack.getItems('items').filter(v => BackpackCleaner._itemsToSell.includes(v.getName()));
        },

        getItemsToSplit () {
            return Panels.Backpack.getItems('items').filter(v => BackpackCleaner._itemsToSplit.includes(v.getName()));
        },

        async split (items = []) {
            for (let i = 0; i < items.length; i++) {
                await ButtonManager.click(`#${items[i].getQuantity()} items splite ${items[i].getId()}`, 180);
                log(`${items[i].getName()} 已分解，数量 ${items[i].getQuantity()}`);
            }
        },

        getItemListWithQuantities (items = []) {
            return items.map(v => v.getName() + '(数量 ' + v.getQuantity() + ')').join('\n');
        }
    };

    class Direction {
        constructor (description) {
            this._description = description;
            this._code = { '东': 'e', '南': 's', '西': 'w', '北': 'n', '东南': 'se', '东北': 'ne', '西南': 'sw', '西北': 'nw', 'east': 'e', 'south': 's', 'west': 'w', 'north': 'n', 'southeast': 'se', 'southwest': 'sw', 'northeast': 'ne', 'northwest': 'nw' }[description];
        }

        getCode () {
            return this._code;
        }
    }

    var Repeater = {
        _actionLink: '',

        confirmAction () {
            let texts = ButtonManager.getButtonTexts();
            let options = [];
            for (let i = 0; i < texts.length; i++) {
                options.push((i + 1) + '. ' + texts[i]);
            }

            if (!options.length) {
                window.alert('当前界面没有命令可以执行。');
                return false;
            }

            let index = window.prompt('要执行当前界面哪个命令（填入数字即可）？\n\n' + options.join('\n'));
            if (parseInt(index)) {
                let link = ButtonManager.getButtonOnclickLink(texts[index - 1]);
                if (!Array.isArray(link)) {
                    Repeater._actionLink = link;
                    return true;
                } else {
                    window.alert('当前界面存在相同命令，无法执行。');
                    return false;
                }
            } else {
                return false;
            }
        },

        fire () {
            ExecutionManager.asyncExecute(Repeater._actionLink);
        }
    };

    var TeamworkHelper = {
        _autoKill: false,
        _leadMode: false,

        enableAutoKill () {
            TeamworkHelper._autoKill = true;
        },

        disableAutoKill () {
            TeamworkHelper._autoKill = false;
        },

        setLeadMode (leadMode) {
            TeamworkHelper._leadMode = leadMode;
        },

        isInLeadMode () {
            return this._leadMode;
        },

        async createTeamIfNeeded () {
            if (!System.globalObjectMap.get('msg_team').get('team_id')) {
                if (!window.confirm('目前没有组队，需要创建一个队伍吗？')) {
                    ButtonManager.resetButtonById('id-team-lead');
                    return;
                }

                await ButtonManager.click('team create;prev');
            }
        },

        identifyTeamLeadName (teamLeadName) {
            let targetUser = System.globalObjectMap.get('msg_friend').elements.filter(v => v['value'].includes(`,${teamLeadName},`));
            if (targetUser.length) {
                let userInfo = targetUser[0]['value'].split(',');

                UserConfigurationManager.saveConfiguration('teamLeadName', userInfo[1]);
                UserConfigurationManager.saveConfiguration('teamLeadId', userInfo[0]);

                return true;
            }
        },

        getTeamLeadName () {
            return UserConfigurationManager.readConfiguration('teamLeadName');
        },

        getTeamLeadId () {
            return UserConfigurationManager.readConfiguration('teamLeadId');
        },

        async move (direction) {
            await ButtonManager.click(direction);
            await TeamworkHelper.notifyTeam(TeamworkHelper._createCommand(direction));

            if (TeamworkHelper._autoKill) {
                await ExecutionManager.wait(1500);
                $('#id-room-cleaner').click();
            }
        },

        async notifyTeam (message) {
            await ButtonManager.click(`team chat ${message}`);
        },

        _createCommand (direction) {
            return new Date().getTime() + '@' + direction + '@';
        },

        _steps: [],
        follow () {
            if (System.globalObjectMap.get('msg_room').get('map_id') === 'shenshousenlin') return;

            let latestMessages = Panels.Notices.getMessages('【队伍】(.*?)：(.*)');
            if (latestMessages.length === 0) return;

            let matches = latestMessages[0].match('【队伍】(.*?)：(.*?)@(n|w|s|e|ne|sw|se|nw)@');
            if (matches) {
                let timestampDiff = new Date().getTime() - parseInt(matches[2]);
                if (timestampDiff <= 8000) {
                    if (!Objects.Room.getPlayers().includes(matches[1])) {
                        ButtonManager.click(matches[3], 0);
                    }
                }
            }
        },

        requestToJoin () {
            ButtonManager.click(`team join ${TeamworkHelper.getTeamLeadId()}`);
        }
    };

    var KnightManager = {
        _keyKnightName: '',
        _puppetSkills: ['茅山道术', '天师灭神剑'],
        _REG_SECRET_TREASURE: '.*?对你悄声道：你现在去(.*?)，.*?',

        async detectUserSettings () {
            KnightManager._keyKnightName = await detectKeyKnight();

            await detectSkills();
            await detectKeyKnight();

            async function detectSkills () {
                let skillView = $('.outtitle').text() === '我的技能';
                await ButtonManager.click('skills');
                if (!skillView) await ButtonManager.click('prev');
            }

            async function detectKeyKnight () {
                let knights = await KnightManager.prioritize();
                debugging('detectKeyKnight...');
                return knights.filter(v => parseInt(v.getProgress()) < 25000).sort((a, b) => b.getProgress() - a.getProgress())[0].getName();
            }
        },

        setKeyKnight (name) {
            UserConfigurationManager.saveConfiguration('keyNightName', name);
        },

        getKeyKnight () {
            return UserConfigurationManager.readConfiguration('keyNightName');
        },

        async capture (name) {
            if (Objects.Room.hasNpc(name)) return;

            await ExecutionManager.asyncExecute("clickButton('open jhqx', 0)", 800);
            await ExecutionManager.asyncExecute(Panels.Knights.findKnightLink(name), 500);
        },

        async giveGold (name, action) {
            await KnightManager.capture(name);

            await Objects.Npc.action(new Npc(name), action);
        },

        async please (name) {
            await ButtonManager.click('score');
            await ButtonManager.click('prev;enforce 0');

            await KnightManager.capture(name);

            await fight(name, '比试', KnightManager._puppetSkills, new CustomizedEvent(this.puppetExists, this.escape));

            let puppetName = Objects.Room.hasNpc('金甲符兵') ? '金甲符兵' : '玄阴符兵';
            await fight(puppetName, '比试');

            await ButtonManager.click('enforce ' + User.attributes.getMaxEnforce());

            async function fight (name, action, skills, additionalStopEvent) {
                let combat = new Combat();
                combat.initialize(new Npc(name), action, skills);
                if (additionalStopEvent) combat.setAdditionalStopEvent(additionalStopEvent);
                await combat.fire();

                await ButtonManager.click('prev_combat');
            }
        },

        puppetExists () {
            return Panels.Combat.containsMessage('金甲符兵|玄阴符兵');
        },

        escape () {
            ButtonManager.click('escape');
        },

        async prioritize () {
            await ExecutionManager.asyncExecute("clickButton('open jhqx', 0)", 800);

            let info = [];
            $('tr').each(function () {
                $(this).find('td').each(function () {
                    if ($(this).text() && $(this).text() !== '遇剑') {
                        info.push($(this).text());
                    }
                });
            });

            let knights = [];
            let numberOfKnights = info.length / 4;
            for (let i = 0; i < numberOfKnights; i++) {
                knights.push(parseKnightInfo(info));
            }

            return sort(knights);

            function sort (knights) {
                let over25000 = knights.filter((v) => v.getProgress() >= 25000);
                over25000.sort((a, b) => a.getProgress() - b.getProgress());

                let lessThan25000 = knights.filter((v) => v.getProgress() < 25000);
                lessThan25000.sort((a, b) => b.getProgress() - a.getProgress());

                return over25000.concat(lessThan25000);
            }

            function parseKnightInfo (info) {
                let nameWithProgress = info.shift();
                let matches = nameWithProgress.match('(.*?)\\(([0-9]{0,5})\\)') || nameWithProgress.match('(.*)');
                let name = matches[1];
                let knight = new Knight(name); info.shift();
                let status = info.shift();

                knight.setAvailability(status !== '师门' && status !== '隐居修炼'); info.shift();
                knight.setProgress(matches.length > 2 ? parseInt(matches[2]) : 0);
                knight.setTalked(false);

                return knight;
            }
        },

        allCandidates: [],
        _stopAskingForFruits: false,
        stopAskingForFruits () {
            log('对话停止。');
            KnightManager._stopAskingForFruits = true;
        },

        async prepareAskingForFruits () {
            KnightManager._stopAskingForFruits = false;

            if (KnightManager.allCandidates.length === 0) {
                KnightManager.allCandidates = await KnightManager.prioritize();
            } else {
                await refreshStatus(KnightManager.allCandidates);
            }

            async function refreshStatus (candidates) {
                await ExecutionManager.asyncExecute("clickButton('open jhqx', 0)", 800);

                candidates.filter((v) => !v.getTalked()).forEach(element => {
                    let place = $('tr').find('td').filter(function (v) {
                        return $(this).text().match(element.getName());
                    }).next().next().text();

                    element.setAvailability(place !== '师门' && place !== '隐居修炼');
                });
            }
        },

        async askForFruits () {
            let candidatesToTalk = KnightManager.allCandidates.filter((v) => !v.getTalked());
            if (candidatesToTalk.length > 0) {
                if (window.confirm(buildPromptMessage('当前未对话奇侠依次如下，确认无误继续？\n\n', candidatesToTalk))) {
                    await talkToKnights(KnightManager.allCandidates);

                    await ButtonManager.click('home');
                    log('所有奇侠对话尝试完毕，本轮跳过的有：' + KnightManager.allCandidates.filter((v) => !v.getTalked()).map(v => v.getName()));
                }
            } else {
                log('没有需要对话的奇侠。');
            }

            ButtonManager.resetButtonById('id-fruits');

            async function talkToKnights (candidates) {
                log('开始对话奇侠...');

                for (let i = 0; i < candidates.length; i++) {
                    if (KnightManager._stopAskingForFruits) {
                        debugging('检测到停止信号不再继续。');
                        break;
                    }

                    if (candidates[i].getTalked()) {
                        continue;
                    } else if (!candidates[i].getAvailability()) {
                        if (i >= 4 || window.confirm(candidates[i].getName() + '当前无法对话，确定跳过继续？按取消可退出本轮对话。')) {
                            debugging(candidates[i].getName() + ' skipped.');
                            continue;
                        }

                        break;
                    }

                    await KnightManager.capture(candidates[i].getName());

                    let talked = await startTalks(new Npc(candidates[i].getName()));
                    debugging('talked=' + talked);
                    candidates[i].setTalked(talked);

                    if (!talked && i < 4) KnightManager._stopAskingForFruits = true;
                }

                async function startTalks (knight) {
                    debugging('准备对话' + knight.getName());

                    let followed = await follow(knight);
                    if (!followed) return false;

                    await Objects.Npc.action(knight, '对话');

                    let pattern = '今日奇侠赠送次数(.*?)/(.*?)，' + knight.getName() + '赠送次数(.*?)/5';
                    let messages = Panels.Notices.filterMessageObjectsByKeyword(pattern);
                    let times = messages.last().text().match(pattern);
                    if (times) {
                        debugging('完成和 ' + knight.getName() + ' 的第 ' + times[3] + ' 次对话。');
                        if (times[1] === times[2]) {
                            log('今天的对话已经全部结束。' + times[1] + '/' + times[2]);
                            KnightManager.stopAskingForFruits();
                            return true;
                        }
                        if (parseInt(times[3]) === 5) {
                            return true;
                        } else {
                            return startTalks(knight);
                        }
                    } else if (Panels.Notices.containsMessage(patternTalkFinished(knight))) {
                        log(knight.getName() + '已经对话过了。');
                        return true;
                    }

                    return false;

                    function patternTalkFinished (knight) {
                        let name = knight.getName();
                        let result = [
                            `${name}盯着你看了一会儿。`,
                            `${name}挺有兴致地跟你聊了起来。`,
                            `${name}睁大眼睛望着你，似乎想问你天气怎么样。`,
                            `${name}说道：嗯....江湖上好玩吗？`,
                            `${name}疑惑地看着你，道：你想干什么？`,
                            `${name}摇摇头，说道：你在这做什么？`,
                            '郭济说道：排云掌法威力奇大，招式飘忽，似乎当年创出此掌法之人出自嵩山，你替我找找看是否还有后人存在'
                        ].join(`|`);
                        debugging('pattern=' + result);
                        return result;
                    }

                    async function follow (knight) {
                        if (Objects.Room.hasNpc(knight.getName())) return true;

                        let pattern = knight.getName() + '往(.*?)离开。';
                        let movements = Panels.Notices.filterMessageObjectsByKeyword(pattern);
                        let movement = movements.last().text().match(pattern);
                        if (movement) {
                            debugging('检测到' + movement[0]);
                            let direction = new Direction(movement[1]);
                            await Navigation.move(direction.getCode());

                            return Objects.Room.hasNpc(knight);
                        }
                    }
                }
            }

            function buildPromptMessage (question, candidates) {
                let message = question;
                for (let i = 0; i < candidates.length; i++) {
                    if (i !== 0) message = message + '\n';

                    message = message + candidates[i].getName() + ' (' + candidates[i].getProgress() + ')';
                    if (!candidates[i].getAvailability()) message = message + ' - 未出师无法对话';
                }

                return message;
            }
        },

        async findSecretTreasure () {
            let room = await identifyPlace();
            if (!room) {
                window.alert('没有找到秘境信息。');
                return;
            }

            let path = PathManager.getPathByRoom(room);
            if (!path) {
                window.alert('本版本暂不支持此秘境：' + room);
                return;
            }

            await Navigation.move(path);
            await Navigation.move('find_task_road secret');
            await ExecutionManager.wait(500);
            ExecutionManager.execute(Objects.Room.filterTargetObjectsByKeyword('仔细搜索').attr('onclick'));

            async function identifyPlace () {
                await ExecutionManager.asyncExecute("clickButton('open jhqx', 0)", 500);
                let messages = Panels.Master.filterMessageObjectsByKeyword(KnightManager._REG_SECRET_TREASURE);
                if (messages.length > 0) {
                    return messages.last().text().match(KnightManager._REG_SECRET_TREASURE)[1];
                }
            }
        }
    };

    class BodySearch {
        async identifyCandidates () {
            debugging('BodySearch::identifyCandidates:body search starts');

            await ButtonManager.click('golook_room');
            this._stop = false;
            this._candidates = Objects.Room.getAvailableItems().filter((v) => v.getId().includes('corpse'));
        }

        async fire () {
            debugging('BodySearch::fire:event fired, this._stop=' + this._stop);

            if (CombatStatus.justFinished()) {
                await ButtonManager.click('prev_combat');
                await this.identifyCandidates();
            }

            if (this._stop || (this._candidates.length === 0 && !CombatStatus.inProgress())) {
                debugging('search done.');
                ButtonManager.resetButtonById('id-body-search');
                await ButtonManager.click('golook_room');
                return true;
            } else {
                debugging('BodySearch::fire:candidates size=' + this._candidates.length);
                let start = new Date();

                for (let i = this._candidates.length - 1; i >= 0; i--) {
                    debugging('get ' + this._candidates[i].getId());
                    ButtonManager.click('get ' + this._candidates[i].getId(), 0);

                    if (await this._searchComplete(this._candidates[i].getId())) {
                        this._candidates.pop();
                    }
                }

                let msToWait = this._candidates.length ? 5010 - (new Date() - start) : 500;
                await ExecutionManager.wait(msToWait);

                return this.fire();
            }
        }

        async _searchComplete (itemId) {
            let stop = this._stop;
            if (!stop) {
                await ExecutionManager.wait(100);

                let latestMessage = Panels.Notices.getLatestMessages()[0];
                if (latestMessage.match('.*?里没有任何东西。')) {
                    stop = true;
                } else if (latestMessage.match('.*?从.*?的尸体里搜出.*?')) {
                    stop = true;

                    await ButtonManager.click(`look_item ${itemId}`);

                    if ($('span.out').text().includes('里面有：')) {
                        debugging(`nothing left in ${itemId}`);
                        stop = false;
                    }
                }
            }

            return stop;
        }

        async terminate () {
            this._stop = true;
        }
    }

    var BodySearchHelper = {
        _search: new BodySearch(),

        async identifyCandidates () {
            await BodySearchHelper._search.identifyCandidates();
        },

        async check () {
            await BodySearchHelper._search.fire();
        },

        stop () {
            BodySearchHelper._search.terminate();
        }
    };

    class Retry {
        constructor (interval = 1000) {
            this._interval = interval;
        }

        initialize (retryEvent, teminateCriterial) {
            this._retryEvent = retryEvent;
            this._terminateCriterial = teminateCriterial;

            this._stop = false;
        }

        async fire () {
            if (!this._stop && (!this._terminateCriterial || !this._terminateCriterial())) {
                await this._retryEvent();
                await ExecutionManager.wait(this._interval);

                await this.fire();
            }
        }

        stop () {
            this._stop = true;
        }
    }

    var EnforceHelper = {
        _enforceSnapshot: 0,

        suppressEnforce () {
            EnforceHelper._enforceSnapshot = parseInt(System.globalObjectMap.get('msg_attrs').get('force_factor'));
            ButtonManager.click('enforce 0', 0);
        },

        recoverEnforce () {
            ButtonManager.click(`enforce ${EnforceHelper._enforceSnapshot}`, 0);
        },

        snapshotEnforce () {
            EnforceHelper._enforceSnapshot = parseInt(System.globalObjectMap.get('msg_attrs').get('force_factor'));
        },

        maximizeEnforce () {
            ButtonManager.click(`enforce ${User.attributes.getMaxEnforce()}`, 0);
        }
    };

    var ForceRecoveryHelper = {
        _retry: new Retry(),
        _actionLink: '',

        reset () {
            ForceRecoveryHelper._retry.initialize(async function fight () {
                EnforceHelper.suppressEnforce();

                ExecutionManager.execute(ForceRecoveryHelper._actionLink);
                await ExecutionManager.execute(Panels.Combat.getSkillLinks('道种心魔经'));
                await ButtonManager.click('#5 escape', 100);
                await ButtonManager.click('prev_combat');

                EnforceHelper.recoverEnforce();
            }, ForceRecoveryHelper.goodEnough);
        },

        goodEnough () {
            let currentForce = parseInt((System.globalObjectMap.get('msg_attrs').get('force')));
            let maxForce = parseInt((System.globalObjectMap.get('msg_attrs').get('max_force')));
            debugging('current/max=' + currentForce + '/' + maxForce);

            return currentForce >= maxForce * 0.9;
        },

        async start (actionLink) {
            ForceRecoveryHelper._actionLink = actionLink;
            await ForceRecoveryHelper._retry.fire();
        },

        stop () {
            ForceRecoveryHelper._retry.stop();
        }
    };

    var RangerSearchManager = {
        _REG_RANGER_APPEARS: '^【系统】游侠会：听说(.*?)出来闯荡江湖了，目前正在前往(.*?)的路上|^【系统】(.*?)在(.*?)，得意地从怀中',

        async identifyRanger () {
            await ButtonManager.click('go_chat');
            let message = Panels.Chatting.filterMessageObjectsByKeyword(RangerSearchManager._REG_RANGER_APPEARS).last().text();
            let regs = RangerSearchManager._REG_RANGER_APPEARS.split('|');
            let info = message.match(regs[0]) || message.match(regs[1]);

            await ButtonManager.click('quit_chat');
            return info;
        }
    };

    var FishingManager = {
        _REG_FISH_OVER: '^整个冰湖的渔获都*?',
        _REG_NO_ROD: '你还没有鱼竿',
        _REG_NO_BAIT: '你还没有鱼饵',

        async gotoTarget () {
            $('#id-escape').click();

            if (await mapLocked()) {
                await Navigation.move(PathManager.getPathForSpecificEvent('扬州出发钓鱼加玄铁'));
            } else {
                await Navigation.move(PathManager.getPathForSpecificEvent('钓鱼加玄铁'));
            }

            if (Objects.Room.getName() === '冰湖') ButtonManager.resetButtonById('id-escape');

            async function mapLocked () {
                await ButtonManager.click('jh 35');
                return Panels.Notices.getLastMessage().includes('此地图还未解锁，请先通关前面的地图');
            }
        },

        fire () {
            let message = Panels.Notices.getLastMessage();

            if (message.match(FishingManager._REG_NO_ROD) || message.match(FishingManager._REG_NO_BAIT)) {
                ButtonManager.click('#5 shop money_buy shop5_N_10;#5 shop money_buy shop6_N_10;diaoyu');
            } else if (message.match(FishingManager._REG_FISH_OVER)) {
                FishingManager.stopFishing();
                ButtonManager.resetButtonById('id-escape');
            }

            ButtonManager.click('diaoyu', 0);
        },

        stopFishing () {
            ButtonManager.click('home');
        }
    };

    var knownBuffers = {
        '排云掌法': 3,
        '九天龙吟剑法': 3,
        '道种心魔经': 3,
        '覆雨剑法': 3,
        '如来神掌': 3,
        '雪饮狂刀': 3,
        '织冰剑法': 3,
        '孔雀翎': 3,
        '飞刀绝技': 3,
        '翻云刀法': 3,
        '万流归一': 3,
        '幽影幻虚步': 3,
        '生生造化功': 3
    };

    class BufferCalculator {
        constructor (skills) {
            if (!Array.isArray(skills)) skills = [skills];

            this._bufferRequired = skills.map(function (skill) {
                return knownBuffers[skill] ? knownBuffers[skill] : 2;
            }).reduce(function (a, b) {
                return a + b;
            });
        }

        getBufferRequired () {
            return this._bufferRequired;
        }
    }

    class Combat {
        constructor (checkInerval = 200, printCombatInfo = false) {
            this._checkInterval = checkInerval;
            this._printCombatInfo = printCombatInfo;
        }

        initialize (npc, action, skills = [], bufferReserved = 0) {
            this._npc = npc;
            this._action = action;
            this._skills = skills;
            this._bufferReserved = bufferReserved;
        }

        async fire () {
            if (!this._npc.getId()) {
                debugging('Combat::fire:npc ' + this._npc.getName() + ' is not available.');
                return false;
            } else {
                await Objects.Npc.action(this._npc, this._action);
                await ExecutionManager.wait(1000);

                if (!CombatStatus.inProgress()) {
                    await ExecutionManager.wait(1000);
                    await Objects.Npc.action(this._npc, this._action);
                }

                return this.perform(this._skills, this._bufferReserved);
            }
        }

        async perform (skills, bufferReserved = 0) {
            if (this._printCombatInfo) debugging('战场信息：', null, Panels.Combat.getCombatInfo);

            if (!CombatStatus.inProgress()) return false;
            if (this.readyToStop()) return true;

            if (this._additionalStopEvent && this._additionalStopEvent.getCriterial()()) {
                this._additionalStopEvent.getAction()();
            } else {
                if (!skills || skills.length === 0) {
                    skills = Panels.Combat.getAvailableAttackSkills()[0];
                }

                if (PerformHelper.readyToPerform(new BufferCalculator(skills).getBufferRequired() + bufferReserved)) {
                    debugging('prepare skills=' + skills);
                    PerformHelper.perform(skills);
                }
            }

            await ExecutionManager.wait(this._checkInterval);

            return this.perform(skills, bufferReserved);
        }

        stopManually () {
            this._stop = true;
        }

        setAdditionalStopEvent (additionalStopEvent) {
            this._additionalStopEvent = additionalStopEvent;
        }

        readyToStop () {
            let result = this._stop || CombatStatus.justFinished();
            if (result) debugging('Combat::readyToStop=true');

            return result;
        }
    }

    class CombatSetting {
        constructor (skills, bufferReserved = 2) {
            this._skills = skills;
            this._bufferReserved = bufferReserved;
        }

        getSkills () {
            return this._skills;
        }

        setSkills (skills) {
            this._skills = skills;
        }

        getBufferReserved () {
            return this._bufferReserved;
        }

        getSkillsAbbr () {
            return this._skills.map(v => v.substr(0, 2)).join('');
        }
    }

    var MiaojiangHelper = {
        async goOutMaze (maze) {
            await Navigation.move(PathManager.getPathForSpecificEvent(maze));
        },

        async produceDrugs () {
            await ButtonManager.click('lianyao');
            await ExecutionManager.wait(500);
            await retry();

            async function retry () {
                debugging('MiaojiangHelper::produceDrugs:retry...');
                let message = Panels.Notices.getLastMessage();
                await ExecutionManager.wait(500);
                if (Panels.Notices.containsMessage('炼药的丹炉已经是滚得发烫，再炼下去恐怕就要裂了。明天再来吧！')) {
                    log('炼药结束，先到安全的地方等着。');
                    await Navigation.move('e;s;s');
                } else {
                    await ExecutionManager.wait(4500);
                    if (message.includes('炼药需要毒琥珀和毒藤胶，你还没有药材。')) {
                        await ButtonManager.click('shop money_buy shop9_N_10');
                        await ButtonManager.click('shop money_buy shop10_N_10');
                        return retry();
                    } else {
                        await ButtonManager.click('lianyao');
                    }

                    return retry();
                }
            }
        }
    };

    var RecoveryHelper = {
        _skill: '道种心魔经',
        _threshold: '0.7',
        _retry: new Retry(500),
        _stopContinualRecovery: false,

        setSkill (skill) {
            RecoveryHelper._skill = skill;
        },

        getSkill () {
            return RecoveryHelper._skill;
        },

        getThreshold () {
            return RecoveryHelper._threshold;
        },

        setThreshold (threshold) {
            RecoveryHelper._threshold = threshold;
        },

        recoverBySkill () {
            let currentKee = System.globalObjectMap.get('msg_attrs').get('kee');
            let maxKee = System.globalObjectMap.get('msg_attrs').get('max_kee');
            if ((currentKee / maxKee) < RecoveryHelper._threshold) {
                debugging('current kee/max kee=' + currentKee + '/' + maxKee);
                PerformHelper.perform(RecoveryHelper._skill);
            }
        },

        async initializeContinualRecover () {
            debugging('ContinualRecover initializing...');
            RecoveryHelper._stopContinualRecovery = false;

            await RecoveryHelper._retry.initialize(async function recover () {
                if (CombatStatus.inProgress()) return;

                if (User.attributes.getCurrentKee() < User.attributes.getMaxKee()) {
                    await ButtonManager.click('#3 recovery', 250);
                }

                if (User.attributes.getCurrentForce() < User.attributes.getMaxForce() * 0.9) {
                    await RecoveryHelper.recoverForce();
                }
            }, function stopWhen () {
                return RecoveryHelper._stopContinualRecovery;
            });
        },

        async startContinualRecovery () {
            await RecoveryHelper._retry.fire();
        },

        stopContinualRecovery () {
            RecoveryHelper._stopContinualRecovery = true;
        },

        async recoverForce () {
            let currentForce = System.globalObjectMap.get('msg_attrs').get('force');
            let maxForce = System.globalObjectMap.get('msg_attrs').get('max_force');
            let gap = maxForce - currentForce;
            if (gap < 2000) {
                log('内力已足 (' + currentForce + '/' + maxForce + ')，无需服用灵芝。');
            } else {
                let times = parseInt(gap / 5000);
                await ButtonManager.click('#' + times + ' items use snow_qiannianlingzhi', 250);
                log('服用 ' + times + ' 棵千年灵芝，当前状态 ' + currentForce + '/' + maxForce);
            }
        }
    };

    var AttackStopper = {
        check () {
            if (!CombatStatus.inProgress()) return;

            let nonAttackSkills = Panels.Combat.getAvailableNonAttackSkills().filter(v => v !== '茅山道术');
            debugging('nonAttackSkills=' + nonAttackSkills);
            if (nonAttackSkills.length && PerformHelper.readyToPerform(new BufferCalculator(nonAttackSkills).getBufferRequired())) {
                PerformHelper.perform(nonAttackSkills[0]);
            }
        }
    };

    var CombatHelper = {
        _autoPerforming: false,
        _autoRecovery: false,
        _defenceMode: false,

        isInUsed () {
            return CombatHelper._autoPerforming || CombatHelper._autoRecovery || CombatHelper._defenceMode;
        },

        check () {
            if (!CombatStatus.inProgress()) return;

            if (CombatHelper._autoRecovery) {
                RecoveryHelper.recoverBySkill();
            }

            if (CombatHelper._defenceMode) {
                AttackStopper.check();
            } else if (CombatHelper._autoPerforming) {
                PerformHelper.fire();
            }
        },

        enableAutoPerforming () {
            CombatHelper._autoPerforming = true;
        },

        disableAutoPerforming () {
            CombatHelper._autoPerforming = false;
        },

        enableAutoRecovery () {
            CombatHelper._autoRecovery = true;
        },

        disableAutoRecovery () {
            CombatHelper._autoRecovery = false;
        },

        enableDefenceMode () {
            CombatHelper._defenceMode = true;
        },

        disableDefenceMode () {
            CombatHelper._defenceMode = false;
        }
    };

    var PerformHelper = {
        _combatSetting: new CombatSetting(['如来神掌', '覆雨剑法'], 2),

        getCombatSetting () {
            return PerformHelper._combatSetting;
        },

        readyToPerform (threshold) {
            return threshold <= Panels.Combat.getCurrentBuffer();
        },

        perform (skills) {
            if (!Array.isArray(skills)) skills = [skills];

            debugging('performing skills ' + skills);
            let links = Panels.Combat.getSkillLinksV2(skills);
            if (links.length > 0) {
                debugging('links=' + links);
                ExecutionManager.execute(links);
            } else {
                let firstSkill = Panels.Combat.getAvailableAttackSkills()[0];
                debugging('first skill=' + firstSkill);
                if (firstSkill) PerformHelper.perform(firstSkill);
            }
        },

        fire () {
            let availableSkills = Panels.Combat.getAvailableSkills(PerformHelper._combatSetting.getSkills());
            if (!availableSkills.length) return;

            let bufferRequired = new BufferCalculator(availableSkills).getBufferRequired() + PerformHelper._combatSetting.getBufferReserved();
            if (PerformHelper.readyToPerform(bufferRequired)) {
                PerformHelper.perform(availableSkills);
            }
        }
    };

    var CombatStatus = {
        justFinished () {
            return Panels.Combat.containsMessage('战斗结束');
        },

        inProgress () {
            return $('#combat_auto_fight').html();
        }
    };

    class Fugitive {
        constructor (message) {
            let matches = message.match(/\[36-40区\](段老大|二娘)逃到了跨服时空(.*?)之中/);
            if (matches) {
                this._fugitiveName = matches[1];
                this._place = matches[2];
            }
        }

        getFugitiveName () {
            return this._fugitiveName;
        }

        getPlace () {
            return this._place;
        }

        toString () {
            return this._fugitiveName + ' (' + this._place + ')';
        }
    };

    var FugitiveSearchManager = {
        _targets: [],

        identifyFugitives () {
            let messages = Panels.Chatting.filterMessageObjectsByKeyword(/【系统】跨服：\[36-40区\](.*?)逃到了跨服时空(.*?)之中，众位英雄快来诛杀。/);
            // let latestMessage = '【系统】[36-40区]段老大慌不择路，逃往了全真教-终南山路';

            if (messages.length) {
                FugitiveSearchManager._targets = [new Fugitive(messages.last().text()), new Fugitive(messages.last().prev().text())];

                let choice = window.prompt('选择哪个目标？\n\n1. ' + FugitiveSearchManager._targets[0].toString() + '\n2. ' + FugitiveSearchManager._targets[1].toString(), 1);
                if (choice) {
                    return FugitiveSearchManager._targets[parseInt(choice) - 1].getPlace();
                }
            }
        },

        async catchTheFugitive (room) {
            await ButtonManager.click(PathManager.getPathByRoom(room));
        }
    };

    var BanditSearchManager = {

        Const: {
            REG_BANDIT_APPEARS: '^【系统】(.*?)对着(.*?)叫道：喂.*?'
        },

        async identifyBandits () {
            let goods = [];
            let evils = [];

            await listOutBandits(goods, evils);

            if (evils.length === 0) {
                log('没有在聊天窗口找到任何正邪消息。');
            } else if (evils.length === 1) {
                return window.window.confirm('确定是这个正邪? \n\n' + goods[0] + ' vs. ' + evils[0]) ? goods[0] : null;
            } else {
                let answer = window.prompt('要去哪个正邪？输入序号数字回车即可。(只按时间顺序列举最近四个正邪，越新序号越大)\n' + buildPromptMessage(goods, evils));
                if (answer === null || parseInt(answer) === null) {
                    log('正邪行动取消，输入必须是数字。');
                } else {
                    return goods[answer];
                }
            }

            return null;

            function buildPromptMessage (goods, evils) {
                let message = '';
                for (let i = 0; i < goods.length; i++) {
                    message = message + '\n' + i + ' - ' + goods[i] + ' vs. ' + evils[i];
                }
                return message;
            }

            async function listOutBandits (goods, evils) {
                await ButtonManager.click('go_chat');

                Panels.Chatting.filterMessageObjectsByKeyword(BanditSearchManager.Const.REG_BANDIT_APPEARS).each(function () {
                    var results = $(this).text().match(BanditSearchManager.Const.REG_BANDIT_APPEARS);
                    goods.push(results[2]);
                    evils.push(results[1]);
                });

                removeLegacyRecords(goods, evils);
            }

            function removeLegacyRecords (goods, evils) {
                if (goods.length <= 4) return;

                goods.splice(0, goods.length - 4);
                evils.splice(0, evils.length - 4);
            }
        }
    };

    var Panels = {
        Chatting: {
            filterMessageObjectsByKeyword: function (regKeyword) {
                return $('span .out3_auto').filter(function () { return $(this).text().match(regKeyword); });
            }
        },

        Notices: {
            filterMessageObjectsByKeyword (regKeyword) {
                return $('.out2').filter(function () { return $(this).text().match(regKeyword); });
            },

            containsMessage (regKeyword) {
                return Panels.Notices.filterMessageObjectsByKeyword(regKeyword).length > 0;
            },

            getLastMessage () {
                return $('.out2').last().text();
            },

            getLatestMessages (numberOfRows = 1) {
                let messages = [];
                $('.out2').slice(-numberOfRows).each(function () {
                    messages.push($(this).text());
                });

                return messages.reverse();
            },

            getMessages (regKeyword, numberOfRows = 1) {
                let messages = [];
                $('.out2').filter(function () {
                    return $(this).text().match(regKeyword);
                }).slice(-numberOfRows).each(function () {
                    messages.push($(this).text());
                });

                return messages.reverse();
            },

            getLatestDragonLink () {
                return $('.out2').filter(function () { return $(this).text().match('^青龙会组织：'); }).last().html().match("(find_qinglong_road.*?)'")[1];
            }
        },

        Score: {
            action (action) {
                $('button.cmd_click2').filter(function () {
                    return $(this).text() === action;
                }).click();
            },

            filterButtonObjectsByKeyword (regKeyword) {
                return $('button.cmd_click2').filter(function () {
                    return $(this).text().match(regKeyword);
                });
            }
        },

        Combat: {
            containsMessage (regKeyword) {
                return $('.out').filter(function () { return $(this).text().match(regKeyword); }).length > 0;
            },

            getSkillLinksV2 (skills) {
                if (!Array.isArray(skills)) skills = [skills];

                return System.globalObjectMap.elements
                    .filter(v => v['key'].includes('skill_button'))
                    .filter(v => skills.includes(System.replaceControlCharBlank(v['value'].get('name'))))
                    .map(v => 'clickButton("playskill ' + v['value'].get('pos') + '", 0)');
            },

            getSkillLinks (skills) {
                let links = [];
                $('.cmd_skill_button').filter(function () {
                    return skills.includes($(this).text());
                }).each(function () {
                    links.push($(this).attr('onclick'));
                });
                return links;
            },

            getAvailableSkills (skills = []) {
                let allAvailableSkills = System.globalObjectMap.elements.filter(v => v['key'].includes('skill_button')).map(v => System.replaceControlCharBlank(v['value'].get('name')));
                if (skills.length > 0) {
                    return allAvailableSkills.filter(v => skills.includes(v));
                } else {
                    return allAvailableSkills;
                }
            },

            getAvailableAttackSkills () {
                let skillsAvailable = Panels.Combat.getAvailableSkills();
                return User.skills.getSkillsEnabled('attack').filter(v => skillsAvailable.includes(v));
            },

            getAvailableNonAttackSkills () {
                let skillsAvailable = Panels.Combat.getAvailableSkills();
                let dodges = User.skills.getSkillsEnabled('recovery');
                let forces = User.skills.getSkillsEnabled('force');
                return dodges.concat(forces).filter(v => skillsAvailable.includes(v));
            },

            getCurrentBuffer () {
                return parseInt($('#combat_xdz_text').text());
            },

            getCombatInfo () {
                let vsInfo = System.globalObjectMap.get('msg_vs_info');
                let result = [];
                for (let i = 1; i <= 2; i++) {
                    for (let j = 1; j <= 4; j++) {
                        result.push(vsInfo.get(`vs${i}_name${j}`));
                    }
                    i === 1 && result.push(' vs. ');
                }
                return result.join('/');
            }
        },

        Master: {
            containsMessage (regKeyword) {
                return Panels.Master.filterMessageObjectsByKeyword(regKeyword).length > 0;
            },

            filterMessageObjectsByKeyword (regKeyword) {
                return $('.out').filter(function () { return $(this).text().match(regKeyword); });
            }
        },

        Family: {
            getActionLink (regKeyword) {
                return $('.cmd_click2').filter(function () { return $(this).text().match(regKeyword); }).last().attr('onclick');
            }
        },

        Skills: {
            group: ['my_skills attack', 'my_skills recovery', 'my_skills force', 'my_skills known'],
            defaultSkills: ['enableskill enable parry iron-sword'],

            async findCurrentSkillIds () {
                await ButtonManager.click('enable');

                SkillManager.oldSkillIds = ['parry iron-sword'];
            },

            async findSkillIdByStatus (status) {
                for (let i = 0; i < Panels.Skills.group.length; i++) {
                    await ButtonManager.click(Panels.Skills.group[i]);

                    let findStatus = $('span .out2:contains(' + status + ')');
                    if (findStatus.length) {
                        SkillManager.newSkillId = findStatus.parent().parent().attr('onclick').match(".*?skills info .*? (.*)'\\)")[1];
                        break;
                    }
                }
            },

            async findSkillIdByName (name) {
                for (let i = 0; i < Panels.Skills.group.length; i++) {
                    await ButtonManager.click(Panels.Skills.group[i]);

                    let findStatus = $('span .out3:contains(' + name + ')');
                    if (findStatus.length) {
                        SkillManager.newSkillId = findStatus.parent().parent().attr('onclick').match(".*?skills info .*? (.*)'\\)")[1];
                        break;
                    }
                }
            }
        },

        Knights: {
            findKnightLink (knight) {
                return $('a').filter(function () { return $(this).text() === knight; }).attr('href');
            }
        },

        Quizzes: {
            getCurrentQuestion () {
                return $('.cmd_click2').first().prev().text().trim();
            },

            highlightAnswer (answer) {
                $('.cmd_click2:contains(' + answer.toUpperCase() + ')').css('color', 'yellow');
            },

            containsMessage (regKeyword) {
                return $('.out').text().match(regKeyword);
            }
        },

        Backpack: {
            getItems (type = 'items') {
                return System.globalObjectMap.get('msg_items').elements.filter(v => v['key'].includes(type)).map(function (v) {
                    let values = v['value'].split(',');
                    let item = new Item(System.replaceControlCharBlank(values[1]), values[0], parseInt(values[2]));
                    return item;
                });
            }
        }
    };

    var Objects = {
        Room: {
            filterTargetObjectsByKeyword (regKeyword) {
                return $('.cmd_click3').filter(function () { return $(this).text().match(regKeyword); });
            },

            getTargetDomByName (name) {
                return $('.cmd_click3').filter(function () { return !name || $(this).text() === name; });
            },

            getNpcDomById (id) {
                return $('.cmd_click3').filter(function () { return $(this).attr('onclick').match('look_npc ' + id); });
            },

            hasNpc (name) {
                return Objects.Room.getTargetDomByName(name).length > 0;
            },

            getName () {
                if (System.globalObjectMap.get('msg_room')) return System.globalObjectMap.get('msg_room').get('short');

                return System.globalObjectMap.get('msg_attrs').get('room_name');
            },

            getType () {
                return System.globalObjectMap.get('msg_room').get('type');
            },

            getAvailableNpcs (name = '') {
                let npcs = [];
                Objects.Room.getTargetDomByName().each(function () {
                    if (name && name !== $(this).text()) return;

                    let matches = $(this).attr('onclick').match('look_npc (.*?)\'');
                    if (matches) {
                        let npc = new Npc($(this).text());
                        npc.setId(matches[1]);
                        npcs.push(npc);
                        debugging('发现 ' + npc.toString());
                    }
                });

                return npcs;
            },

            getAvailableNpcsV2 (name = '', fighting = false) {
                return System.globalObjectMap.get('msg_room').elements.filter(function (v) {
                    if (!v['key'].includes('npc')) return false;

                    let values = v['value'].split(',');
                    if (name && name !== System.replaceControlCharBlank(values[1])) return false;
                    if (fighting && values[2] !== '1') return false;

                    return true;
                }).map(function (v) {
                    let values = v['value'].split(',');
                    let npc = new Npc(System.replaceControlCharBlank(values[1]), values[0]);
                    debugging('发现 ' + npc.toString());
                    return npc;
                });
            },

            getAvailableItemsV2 () {
                return System.globalObjectMap.get('msg_room').elements.filter(v => v['key'].includes('item')).map(function (v) {
                    let values = v['value'].split(',');
                    let item = new Item(values[1], values[0]);
                    debugging('发现 ' + item.toString());
                    return item;
                });
            },

            getAvailableItems () {
                let items = [];
                Objects.Room.getTargetDomByName().each(function () {
                    let matches = $(this).attr('onclick').match('look_item (.*?)\'');
                    if (matches) {
                        let item = new Item($(this).text());
                        item.setId(matches[1]);
                        items.push(item);
                        debugging('发现 ' + item.toString());
                    }
                });

                return items;
            },

            getPlayers () {
                return System.globalObjectMap.get('msg_room').elements.filter(v => v['key'].includes('user')).map(v => System.replaceControlCharBlank(v['value'].split(',')[1]));
            },

            isSecurePlace () {
                return Objects.Room.filterTargetObjectsByKeyword('仔细搜索').attr('onclick');
            },

            getAllDirections () {
                return System.globalObjectMap.get('msg_room').elements.filter(v => v['key'].match('east|south|west|north')).map(function (v) {
                    let direction = new Direction(v['key']);
                    return direction.getCode();
                });
            },

            getDirectionByRandom () {
                let directions = Objects.Room.getAllDirections();
                return directions[Math.floor(Math.random() * directions.length)];
            },

            getEventByName (eventName) {
                return $('button').filter(function () { return !eventName || $(this).text() === eventName; }).attr('onclick');
            }
        },

        Npc: {
            getActionLink (action) {
                return $('.cmd_click2').filter(function () { return $(this).text() === action; }).attr('onclick');
            },

            async action (npc, action, times = 1) {
                debugging(action + ' ' + npc.getName() + (times > 1 ? ', times=' + times : ''));

                switch (action) {
                    case '对话':
                        for (let i = 0; i < times; i++) {
                            await ButtonManager.click('ask ' + npc.getId());
                        }

                        break;
                    case '比试':
                        await ButtonManager.click('fight ' + npc.getId());
                        break;
                    case '杀死':
                        await ButtonManager.click('kill ' + npc.getId());
                        break;
                    case '观战':
                        await ButtonManager.click('watch_vs ' + npc.getId());
                        break;
                    default:
                        await ExecutionManager.asyncExecute(Objects.Room.getNpcDomById(npc.getId()).attr('onclick'), 1000);
                        let actionLink = Objects.Npc.getActionLink(action);
                        for (let i = 0; i < times; i++) {
                            await ExecutionManager.asyncExecute(actionLink, 200);
                        }
                }
            },

            getIdByName (name) {
                let find = Objects.Room.getTargetDomByName(name).last();
                if (find.length > 0) {
                    return find.attr('onclick').match(".*?look_npc (.*?)'")[1];
                }
            }
        },

        Item: {
            getActionLink (action) {
                return $('.cmd_click2').filter(function () { return $(this).text() === action; }).attr('onclick');
            },

            async action (item, action, times = 1) {
                debugging(action + ' ' + item.getName() + ', times=' + times);

                await ExecutionManager.asyncExecute(Objects.Room.getTargetDomByName(item.getName()).attr('onclick'), 800);
                let actionLink = Objects.Item.getActionLink(action);
                for (let i = 0; i < times; i++) {
                    await ExecutionManager.asyncExecute(actionLink, 100);
                }

                return actionLink;
            },

            getIdByName (name) {
                let find = Objects.Room.getTargetDomByName(name).last();
                if (find.length > 0) {
                    return find.attr('onclick').match(".*?look_item (.*?)'")[1];
                }
            }
        }
    };

    var UserConfigurationManager = {
        _uid: User.getId(),

        saveConfiguration (key, value) {
            window.GM_setValue(`${UserConfigurationManager._uid}.${key}`, value);
        },

        readConfiguration (key) {
            return window.GM_getValue(`${UserConfigurationManager._uid}.${key}`);
        }
    };

    var ClanCombatHelper = {
        _place: '',

        async back () {
            let roomName = Objects.Room.getName();
            let matches = roomName.match(/武林广场(.*)/);
            let numberOfSteps = parseInt(matches[1]) - 1;

            await Navigation.move(`#${numberOfSteps} w`);
        }
    };

    var MapCleanerV2 = {
        _retry: new Retry(100),
        _path: [],
        _stop: false,

        initialize (travelsalPath = [], interval = 2500) {
            MapCleanerV2._stop = false;
            MapCleanerV2._path = travelsalPath;

            MapCleanerV2._retry.initialize(async function killAndMove () {
                let npcs = Objects.Room.getAvailableNpcsV2().filter(v => !v.getId().includes('hero'));
                if (npcs.length) {
                    let combat = new Combat();
                    combat.initialize(npcs[0], '杀死');
                    await combat.fire();

                    await ExecutionManager.wait(interval);
                }

                if (!Objects.Room.getAvailableNpcsV2().filter(v => !v.getId().includes('hero')).length) {
                    await Navigation.move(MapCleanerV2._path.shift());
                }
            }, function stopWhen () {
                return MapCleanerV2._stop;
            });
        },

        async gotoStartPoint (startPath) {
            await Navigation.move(startPath);
        },

        async start () {
            MapCleanerV2._retry.fire();
        },

        stop () {
            MapCleanerV2._stop = true;
        }
    };

    var MapCleaner = {
        _retry: new Retry(500),
        _path: [],
        _stop: false,

        reset () {
            MapCleaner._stop = false;

            MapCleaner._retry.initialize(async function killAndMove () {
                let npcs = Objects.Room.getAvailableNpcsV2().filter(v => !v.getId().includes('hero'));
                if (npcs.length) {
                    let combat = new Combat();
                    combat.initialize(npcs[0], '杀死');
                    $('#id-body-search').click();
                    await combat.fire();

                    await ExecutionManager.wait(1200);
                }

                if (!Objects.Room.getAvailableNpcsV2().filter(v => !v.getId().includes('hero')).length) {
                    await Navigation.move(Objects.Room.getDirectionByRandom());
                }
            }, function stopWhen () {
                return MapCleaner._stop;
            });
        },

        async start () {
            MapCleaner._retry.fire();
        },

        stop () {
            MapCleaner._stop = true;
        }
    };

    var SkillManager = {
        oldSkillIds: [],
        newSkillId: 0,

        async restartPractice () {
            await Panels.Skills.findCurrentSkillIds();

            await Panels.Skills.findSkillIdByStatus('练习中');
            if (!SkillManager.newSkillId) {
                let answer = window.prompt('没有检查到任何技能在练习中。请指定需要练习的技能名字？');
                if (!answer) return;

                debugging('answer=' + answer);
                await Panels.Skills.findSkillIdByName(answer);
                if (!SkillManager.newSkillId) {
                    debugging('Skill ' + answer + " doesn't exist. Action cancelled.");
                    return;
                }
            }

            ButtonManager.click('practice stop;enable ' + SkillManager.newSkillId + ';practice ' + SkillManager.newSkillId);
        },

        reEnableSkills: async function (template = 1) {
            await ButtonManager.click('enable mapped_skills restore go ' + template);
        },

        prepareAttackSkills: function (choice) {
            let commands = [];

            switch (parseInt(choice)) {
                case 1:
                    commands = [
                        'enableskill enable tao-mieshen-sword',
                        'enableskill enable tao-mieshen-sword attack_select',
                        'enableskill enable parry iron-sword'
                    ].join(';');
                    break;
                case 2:
                    commands = [
                        'enableskill enable tao-mieshen-sword',
                        'enableskill enable tao-mieshen-sword no_attack_select',
                        'enableskill enable parry iron-sword'
                    ].join(';');
                    break;
                case 3:
                    commands = [
                        'enableskill enable force necromancy',
                        'enableskill enable necromancy attack_select',
                        'enableskill enable force bahuang-gong'
                    ].join(';');
                    break;
                case 4:
                    commands = [
                        'enableskill enable force necromancy',
                        'enableskill enable necromancy no_attack_select',
                        'enableskill enable force bahuang-gong'
                    ].join(';');
                    break;
                case 5:
                    commands = 'enableskill enable qiankun-danuoyi attack_select';
                    break;
                case 6:
                    commands = 'enableskill enable qiankun-danuoyi no_attack_select';
                    break;
            }

            ButtonManager.click(commands, 500);
        }
    };

    class ButtonLabel {
        constructor (text, title, color = '') {
            this._text = text;
            this._color = color;
            this._title = title;
        }

        getText () {
            return this._text;
        }

        getTitle () {
            return this._title;
        }

        getColor () {
            return this._color;
        }
    }

    var ButtonManager = {
        async click (actionString, delay = 200) {
            let array = actionString.includes('#') ? actionString.split(';').extract() : actionString.split(';');

            for (let i = 0; i < array.length; i++) {
                await ExecutionManager.asyncExecute("clickButton('" + array[i] + "')", delay);
            }
        },

        simpleToggleButtonEvent (button, toggleLabel = '') {
            if (button.innerText !== button.name) {
                debugging('revert from simple toggle mode');
                button.innerText = button.name;
                button.style.color = '';

                return false;
            } else {
                debugging('switching to simple toggle mode');
                button.innerText = toggleLabel || 'x ' + button.name;
                button.style.color = 'red';

                return true;
            }
        },

        toggleButtonEvent (button, defaultLabel, toggleLabel) {
            if (button.innerText === defaultLabel.getText()) {
                debugging('switching to toggle mode');
                button.innerText = toggleLabel.getText();
                button.style.color = toggleLabel.getColor();

                return true;
            } else {
                debugging('revert from toggle mode');
                button.innerText = defaultLabel.getText();
                button.style.color = defaultLabel.getColor();

                return false;
            }
        },

        resetButtonById (buttonId) {
            let button = $('#' + buttonId);
            if (button.css('color') !== 'rgb(0, 0, 0)') button.click();
        },

        isButtonPressed (buttonId) {
            let button = $('#' + buttonId);
            return button.text().includes('x');
        },

        pressDown (buttonId) {
            let button = $('#' + buttonId);
            if (button.css('color') === 'rgb(0, 0, 0)') button.click();
        },

        getButtonOnclickLink (action) {
            return $('button').filter(function () { return $(this).text() === action; }).attr('onclick');
        },

        getButtonTexts () {
            let texts = [];
            $('button.cmd_click2').each(function () {
                texts.push($(this).text());
            });
            return texts;
        },

        resetAllButtons () {

        }
    };

    var DragonMonitor = {
        _active: false,
        _killBadPeople: true,
        _inProgress: false,

        _goodTargets: {
            '秀楼': '柳小花', '书房': '柳绘心', '北大街': '卖花姑娘', '厅堂': '方寡妇', '钱庄': '刘守财', '杂货铺': '方老板', '祠堂大门': '朱老伯', '南市': '客商', '打铁铺子': '王铁匠', '桑邻药铺': '杨掌柜'
        },

        _REG_DRAGON_APPERS: `^青龙会组织：((\\[${User.getAreaRange().replace('-', '\\-')}\\])?.*?)正在(.*?)施展力量，本会愿出(.*?)的战利品奖励给本场战斗的最终获胜者。这是本(大)?区第(.*?)个(跨服)?青龙。`,

        isActive () {
            return DragonMonitor._active;
        },

        start () {
            DragonMonitor._active = true;
            log('Dragon Monitor started.');
        },

        stop () {
            DragonMonitor._active = false;
            log('Dragon Monitor stopped.');
        },

        getRegKeywords4ExcludedTargets () {
            let existingSetting = UserConfigurationManager.readConfiguration('dragonMonitorRegKeywords4ExcludedTargets');
            return existingSetting || (User.getId() === 'u4234800' ? ['天寒', '残雪', '明月'] : ['轩辕剑碎片', '破岳']);
        },

        setRegKeywords4ExcludedTargets (regKeywords4ExcludedTargets) {
            UserConfigurationManager.saveConfiguration('dragonMonitorRegKeywords4ExcludedTargets', regKeywords4ExcludedTargets);
        },

        getKillBadPeople () {
            return DragonMonitor._killBadPeople;
        },

        setKillBadPerson (killBadPeople = true) {
            DragonMonitor._killBadPeople = killBadPeople;
        },

        getRegKeywords () {
            let existingSetting = UserConfigurationManager.readConfiguration('dragonMonitorRegKeyWords');
            return existingSetting || (User.getId() === 'u4234800' ? ['轩辕剑|破岳|鱼肠', '小李飞刀'] : ['碎片', '斩龙宝镯']);
        },

        setRegKeywords (regKeywords) {
            UserConfigurationManager.saveConfiguration('dragonMonitorRegKeyWords', regKeywords);
        }
    };

    class Dragon {
        setAvailability (availability) {
            this._availability = availability;
        }

        getAvailability () {
            return this._availability;
        }

        setEvil (evil) {
            this._evil = evil;
        }

        getEvil () {
            return this._evil;
        }

        setRoom (room) {
            this._room = room;
        }

        getRoom () {
            return this._room;
        }

        setBonus (bonus) {
            this._bonus = bonus;
        }

        getBonus () {
            return this._bonus;
        }

        setCounter (counter) {
            this._counter = counter;
        }

        getCounter () {
            return this._counter;
        }

        setLink (link) {
            this._link = link;
        }

        getLink () {
            return this._link;
        }

        toString () {
            return this._room + '/' + this._evil + '/' + this._bonus;
        }
    };

    class DragonMessageHandler {
        constructor (dragon) {
            this._dragon = dragon;
        }

        async handle () {
            MessageMonitor.disable();

            if (DragonMonitor._regKeywords4ExcludedTargets.some(v => this._dragon.getBonus().match(v))) {
                log('指定过滤掉不抢的目标：' + this._dragon.getBonus());
            } else if (DragonMonitor._regKeywords.some(v => this._dragon.getBonus().match(v))) {
                log('发现需要的目标：' + this._dragon.getBonus());

                await fire(this._dragon, DragonHelper.killDirectly);
            } else if (DragonHelper.observerMode(this._dragon)) {
                log('发现需要观察的目标：' + this._dragon.getBonus());

                await fire(this._dragon, DragonHelper.observe);
            } else {
                log('没有在关注列表里的目标：' + this._dragon.getBonus());
            }

            MessageMonitor.enable();

            async function fire (dragon, action) {
                await ButtonManager.click(dragon.getLink(), 50);
                let npcs = await DragonHelper.locateRoomInformation(dragon);
                let npc = await DragonHelper.locateTargetNpc(npcs);

                await action(npc);

                debugging('战斗前在场 npc：' + npcs.map(v => v.getName()).join(','));
                await Navigation.move('escape;prev;home');
            }
        }
    };

    var DragonHelper = {
        identifyDragonEvent (message) {
            return System.replaceControlCharBlank(message.get('msg')).match(DragonMonitor._REG_DRAGON_APPERS);
        },

        async locateRoomInformation (dragon) {
            let target = DragonMonitor.getKillBadPeople() ? dragon.getEvil() : DragonMonitor._goodTargets[dragon.getRoom()];
            let npcs = Objects.Room.getAvailableNpcsV2(target, true);
            debugging('在场玩家：', null, DragonHelper.getUserList);

            while (!npcs.length) {
                debugging('房间信息未刷新，等待并重新刷新检测 - ', Objects.Room.getName);
                await ExecutionManager.wait(20);
                npcs = Objects.Room.getAvailableNpcsV2(target, true);
                debugging('在场玩家：', null, DragonHelper.getUserList);
            }

            return npcs;
        },

        async locateTargetNpc (npcs) {
            if (npcs.length === 1) return npcs[0];

            for (let i = 0; i < npcs.length; i++) {
                await Objects.Npc.action(npcs[i], '观战');
                await ExecutionManager.wait(100);

                if (DragonHelper.isTarget(npcs[i])) return npcs[i];
            }
        },

        isTarget (npc) {
            let npcKee = parseInt(System.globalObjectMap.get('msg_vs_info').get('vs2_kee1'));
            if (npcKee > 1000 * 10000) {
                debugging(npc.getName() + ' 血量为 ' + npcKee + ', 锁定青龙，加入战斗。', null, Panels.Combat.getCombatInfo);
                return true;
            } else {
                debugging(npc.getName() + ' 血量才 ' + npcKee + '，不是青龙果断放过。');
                return false;
            }
        },

        getUserList () {
            return Objects.Room.getPlayers().join(',');
        },

        parseDragonInfo (matches) {
            let dragon = new Dragon();
            dragon.setAvailability(true);
            dragon.setEvil(matches[1]);
            dragon.setBonus(matches[4]);
            dragon.setCounter(parseInt(matches[6]));

            let placeInfo = matches[3].split(';')[2].split('');
            dragon.setRoom(placeInfo[1]);
            dragon.setLink(placeInfo[0]);

            return dragon;
        },

        observerMode (dragon) {
            return DragonMonitor._regKeywords.some(v => dragon.getBonus().match(v.replace(/"/g, '')));
        },

        async observe (npc) {
            await Objects.Npc.action(npc, '观战');

            for (let i = 0; i < 15; i++) {
                debugging('战场信息：', null, Panels.Combat.getCombatInfo);
                await ExecutionManager.wait(500);
            }
        },

        async killDirectly (npc) {
            let combat = new Combat();
            combat.initialize(npc, '杀死');
            await combat.fire();
        }
    };

    var MessageMonitor = {
        _enabled: false,

        enable () {
            log('Message monitor enabled.');
            MessageMonitor._enabled = true;
        },

        disable () {
            log('Message monitor disabled.');
            MessageMonitor._enabled = false;
        },

        isEnabled () {
            return DragonMonitor.isActive() || TeamworkHelper.isInLeadMode();
        }
    };

    class MessageHandler {
        constructor (message) {
            this._message = message;
        }

        handle () {
            if (this._message.get('type') === 'attrs_changed') return;

            debugging(`${this._message.get('type')}|${this._message.get('subtype')}`, this._message.elements);

            switch (this._message.get('type')) {
                case 'main_msg':
                    let msg = this._message.get('msg');
                    if (msg.includes('青龙会组织') && DragonMonitor.isActive() && !CombatStatus.inProgress()) {
                        if (msg.includes('[') && !msg.includes(User.getAreaRange())) return;

                        let dragonEvent = DragonHelper.identifyDragonEvent(this._message);
                        if (dragonEvent) {
                            let dragon = DragonHelper.parseDragonInfo(dragonEvent);
                            debugging('dragon info identified:', dragon);

                            new DragonMessageHandler(dragon).handle();
                        }
                    }

                    break;
                case 'prompt':
                    if (TeamworkHelper.isInLeadMode() && this._message.get('msg').includes('想要加入你的队伍。')) {
                        let msgTeam = System.globalObjectMap.get('msg_team');
                        if (msgTeam.get('member_num') === msgTeam.get('max_member_num')) return;

                        ButtonManager.click(this._message.get('cmd1'), 0);
                    }
            }
        }
    };

    var ExecutionManager = {
        execute (commands) {
            if (!Array.isArray(commands)) commands = [commands];

            debugging('executing ' + commands);
            for (let i = 0; i < commands.length; i++) eval(commands[i]);
        },

        async asyncExecute (commands, delay = 200) {
            if (!Array.isArray(commands)) commands = [commands];

            for (let i = 0; i < commands.length; i++) {
                debugging('async executing ' + commands[i]);

                await eval(commands[i]);
                if (delay > 0) await ExecutionManager.wait(Math.floor(Math.random() * 50 + delay));
            }
        },

        async debug (timeout) {
            debugging('应调试需要等待 ' + timeout + ' 毫秒。');
            await ExecutionManager.wait(timeout);
        },

        async wait (timeout) {
            return new Promise((resolve, reject) => { setTimeout(function () { resolve(); }, timeout); });
        }
    };

    var QuizzesHelper = {
        _stop: false,

        reset () {
            QuizzesHelper._stop = false;
        },

        stop () {
            QuizzesHelper._stop = true;
        },

        getAnswer (question) {
            return QuizzesHelper.answers[question.trim()];
        },

        async answer () {
            await ButtonManager.click('question', 300);

            if (QuizzesHelper._stop || Panels.Quizzes.containsMessage('每日武林知识问答次数已经达到限额') || Panels.Notices.containsMessage('每日武林知识问答次数已经达到限额')) {
                ButtonManager.resetButtonById('btnQuizzesHelper');
                return;
            }

            let question = Panels.Quizzes.getCurrentQuestion();
            if (!question || question.match('获得经验.*?、潜能.*?、银两.*?')) {
                setTimeout(QuizzesHelper.answer, 300);
                return;
            }

            let answer = QuizzesHelper.getAnswer(question);
            debugging(`question=${question}, answer=${answer}`);
            if (answer) {
                Panels.Quizzes.highlightAnswer(answer);
                await ExecutionManager.wait(1000);
                ButtonManager.click('question ' + answer);

                setTimeout(QuizzesHelper.answer, 300);
            } else {
                log('问题太难了，无法回答: ' + question);
            }
        },

        answers: { '铁手镯 可以在哪位npc那里获得？': 'a', '“白玉牌楼”场景是在哪个地图上？': 'c', '“百龙山庄”场景是在哪个地图上？': 'b', '“冰火岛”场景是在哪个地图上？': 'b', '“常春岛渡口”场景是在哪个地图上？': 'c', '“跪拜坪”场景是在哪个地图上？': 'b', '“翰墨书屋”场景是在哪个地图上？': 'c', '“花海”场景是在哪个地图上？': 'a', '“留云馆”场景是在哪个地图上？': 'b', '“日月洞”场景是在哪个地图上？': 'b', '“蓉香榭”场景是在哪个地图上？': 'c', '“三清殿”场景是在哪个地图上？': 'b', '“三清宫”场景是在哪个地图上？': 'c', '“双鹤桥”场景是在哪个地图上？': 'b', '“无名山脚”场景是在哪个地图上？': 'd', '“伊犁”场景是在哪个地图上？': 'b', '“鹰记商号”场景是在哪个地图上？': 'd', '“迎梅客栈”场景是在哪个地图上？': 'd', '“子午楼”场景是在哪个地图上？': 'c', '8级的装备摹刻需要几把刻刀': 'a', 'NPC公平子在哪一章地图': 'a', '瑷伦在晚月庄的哪个场景': 'b', '安惜迩是在那个场景': 'c', '黯然销魂掌有多少招式？': 'c', '黯然销魂掌是哪个门派的技能': 'a', '八卦迷阵是哪个门派的阵法？': 'b', '八卦迷阵是那个门派的阵法': 'a', '白金戒指可以在哪位那里获得？': 'b', '白金手镯可以在哪位那里获得？': 'a', '白蟒鞭的伤害是多少？': 'a', '白驼山第一位要拜的师傅是谁': 'a', '白银宝箱礼包多少元宝一个': 'd', '白玉腰束是腰带类的第几级装备？': 'b', '拜师风老前辈需要正气多少': 'b', '拜师老毒物需要蛤蟆功多少级': 'a', '拜师铁翼需要多少内力': 'b', '拜师小龙女需要容貌多少': 'c', '拜师张三丰需要多少正气': 'b', '包家将是哪个门派的师傅': 'a', '包拯在哪一章': 'd', '宝石合成一次需要消耗多少颗低级宝石？': 'c', '宝玉帽可以在哪位那里获得？': 'd', '宝玉鞋击杀哪个可以获得': 'a', '宝玉鞋在哪获得': 'a', '暴雨梨花针的伤害是多少？': 'c', '北斗七星阵是第几个的组队副本': 'c', '北冥神功是哪个门派的技能': 'b', '北岳殿神像后面是哪位': 'b', '匕首加什么属性': 'c', '碧海潮生剑在哪位师傅处学习': 'a', '碧磷鞭的伤害是多少？': 'b', '镖局保镖是挂机里的第几个任务': 'd', '冰魄银针的伤害是多少？': 'b', '病维摩拳是哪个门派的技能': 'b', '不可保存装备下线多久会消失': 'c', '不属于白驼山的技能是什么': 'b', '沧海护腰可以镶嵌几颗宝石': 'd', '沧海护腰是腰带类的第几级装备？': 'a', '藏宝图在哪个NPC处购买': 'a', '藏宝图在哪个处购买': 'b', '藏宝图在哪里那里买': 'a', '草帽可以在哪位那里获得？': 'b', '成功易容成异性几次可以领取易容成就奖': 'b', '成长计划第七天可以领取多少元宝？': 'd', '成长计划六天可以领取多少银两？': 'd', '成长计划需要多少元宝方可购买？': 'a', '城里打擂是挂机里的第几个任务': 'd', '充值积分不可以兑换下面什么物品': 'd', '出生选武学世家增加什么': 'a', '闯楼第几层可以获得称号“藏剑楼护法”': 'b', '闯楼第几层可以获得称号“藏剑楼楼主”': 'd', '闯楼第几层可以获得称号“藏剑楼长老”': 'c', '闯楼每多少层有称号奖励': 'a', '春风快意刀是哪个门派的技能': 'b', '春秋水色斋需要多少杀气才能进入': 'd', '从哪个处进入跨服战场': 'a', '摧心掌是哪个门派的技能': 'a', '达摩在少林哪个场景': 'c', '达摩杖的伤害是多少？': 'd', '打开引路蜂礼包可以得到多少引路蜂？': 'b', '打排行榜每天可以完成多少次？': 'a', '打土匪是挂机里的第几个任务': 'c', '打造刻刀需要多少个玄铁': 'a', '打坐增长什么属性': 'a', '大保险卡可以承受多少次死亡后不降技能等级？': 'b', '大乘佛法有什么效果': 'd', '大旗门的修养术有哪个特殊效果': 'a', '大旗门的云海心法可以提升哪个属性': 'c', '大招寺的金刚不坏功有哪个特殊效果': 'a', '大招寺的铁布衫有哪个特殊效果': 'c', '当日最低累积充值多少元即可获得返利？': 'b', '刀法基础在哪掉落': 'a', '倒乱七星步法是哪个门派的技能': 'd', '等级多少才能在世界频道聊天？': 'c', '第一个副本需要多少等级才能进入': 'd', '貂皮斗篷是披风类的第几级装备？': 'b', '丁老怪是哪个门派的终极师傅': 'a', '丁老怪在星宿海的哪个场景': 'b', '东方教主在魔教的哪个场景': 'b', '斗转星移是哪个门派的技能': 'a', '斗转星移阵是哪个门派的阵法': 'a', '毒龙鞭的伤害是多少？': 'a', '毒物阵法是哪个门派的阵法': 'b', '独孤求败有过几把剑？': 'd', '独龙寨是第几个组队副本': 'a', '读书写字301-400级在哪里买书': 'c', '读书写字最高可以到多少级': 'b', '端茶递水是挂机里的第几个任务': 'b', '断云斧是哪个门派的技能': 'a', '锻造一把刻刀需要多少玄铁碎片锻造？': 'c', '锻造一把刻刀需要多少银两？': 'a', '兑换易容面具需要多少玄铁碎片': 'c', '多少消费积分换取黄金宝箱': 'a', '多少消费积分可以换取黄金钥匙': 'b', '翻译梵文一次多少银两': 'd', '方媃是哪个门派的师傅': 'b', '飞仙剑阵是哪个门派的阵法': 'b', '风老前辈在华山哪个场景': 'b', '风泉之剑加几点悟性': 'c', '风泉之剑可以在哪位那里获得？': 'b', '风泉之剑在哪里获得': 'd', '疯魔杖的伤害是多少？': 'b', '伏虎杖的伤害是多少？': 'c', '副本完成后不可获得下列什么物品': 'b', '副本有什么奖励': 'd', '富春茶社在哪一章': 'c', '改名字在哪改？': 'd', '丐帮的绝学是什么': 'a', '丐帮的轻功是哪个': 'b', '干苦力是挂机里的第几个任务': 'a', '钢丝甲衣可以在哪位那里获得？': 'd', '高级乾坤再造丹加什么': 'b', '高级乾坤再造丹是增加什么的？': 'b', '高级突破丹多少元宝一颗': 'd', '割鹿刀可以在哪位npc那里获得？': 'b', '葛伦在大招寺的哪个场景': 'b', '根骨能提升哪个属性': 'c', '功德箱捐香火钱有什么用': 'a', '功德箱在雪亭镇的哪个场景？': 'c', '购买新手进阶礼包在挂机打坐练习上可以享受多少倍收益？': 'b', '孤独求败称号需要多少论剑积分兑换': 'b', '孤儿出身增加什么': 'd', '古灯大师是哪个门派的终极师傅': 'c', '古灯大师在大理哪个场景': 'c', '古墓多少级以后才能进去？': 'd', '寒玉床睡觉修炼需要多少点内力值': 'c', '寒玉床睡觉一次多久': 'c', '寒玉床需要切割多少次': 'd', '寒玉床在哪里切割': 'a', '寒玉床在那个地图可以找到？': 'a', '黑狗血在哪获得': 'b', '黑水伏蛟可以在哪位npc那里获得？': 'c', '洪帮主在洛阳哪个场景': 'c', '虎皮腰带是腰带类的第几级装备？': 'a', '花不为在哪一章': 'a', '铁手镯 可以在哪位npc那里获得？': 'a', '花花公子在哪个地图': 'a', '华山村王老二掉落的物品是什么': 'a', '华山武器库从哪个NPC进': 'd', '黄宝石加什么属性': 'c', '黄岛主在桃花岛的哪个场景': 'd', '黄袍老道是哪个门派的师傅': 'c', '积分商城在雪亭镇的哪个场景？': 'c', '技能柳家拳谁教的？': 'a', '技能数量超过了什么消耗潜能会增加': 'b', '嫁衣神功是哪个门派的技能': 'b', '剑冢在哪个地图': 'a', '街头卖艺是挂机里的第几个任务': 'a', '金弹子的伤害是多少？': 'a', '金刚不坏功有什么效果': 'a', '金刚杖的伤害是多少？': 'a', '金戒指可以在哪位npc那里获得？': 'd', '金手镯可以在哪位npc那里获得？': 'b', '金丝鞋可以在哪位npc那里获得？': 'b', '金项链可以在哪位npc那里获得？': 'd', '金玉断云是哪个门派的阵法': 'a', '锦缎腰带是腰带类的第几级装备？': 'a', '精铁棒可以在哪位那里获得？': 'd', '九区服务器名称': 'd', '九阳神功是哪个门派的技能': 'c', '九阴派梅师姐在星宿海哪个场景': 'a', '军营是第几个组队副本': 'b', '开通VIP月卡最低需要当天充值多少元方有购买资格？': 'a', '可以召唤金甲伏兵助战是哪个门派？': 'a', '客商在哪一章': 'b', '孔雀氅可以镶嵌几颗宝石': 'b', '孔雀氅是披风类的第几级装备？': 'c', '枯荣禅功是哪个门派的技能': 'a', '跨服是星期几举行的': 'b', '跨服天剑谷每周六几点开启': 'a', '跨服需要多少级才能进入': 'c', '跨服在哪个场景进入': 'c', '兰花拂穴手是哪个门派的技能': 'a', '蓝宝石加什么属性': 'a', '蓝止萍在哪一章': 'c', '蓝止萍在晚月庄哪个小地图': 'b', '老毒物在白驮山的哪个场景': 'b', '老顽童在全真教哪个场景': 'b', '烈火旗大厅是那个地图的场景': 'c', '烈日项链可以镶嵌几颗宝石': 'c', '林祖师是哪个门派的师傅': 'a', '灵蛇杖法是哪个门派的技能': 'c', '凌波微步是哪个门派的技能': 'b', '凌虚锁云步是哪个门派的技能': 'b', '领取消费积分需要寻找哪个NPC？': 'c', '鎏金缦罗是披风类的第几级装备？': 'd', '柳淳风在哪一章': 'c', '柳淳风在雪亭镇哪个场景': 'b', '柳文君所在的位置': 'a', '六脉神剑是哪个门派的绝学': 'a', '陆得财是哪个门派的师傅': 'c', '陆得财在乔阴县的哪个场景': 'a', '论剑每天能打几次': 'a', '论剑是每周星期几': 'c', '论剑是什么时间点正式开始': 'a', '论剑是星期几进行的': 'c', '论剑是星期几举行的': 'c', '论剑输一场获得多少论剑积分': 'a', '论剑要在晚上几点前报名': 'b', '论剑在周几进行？': 'b', '论剑中步玄派的师傅是哪个': 'a', '论剑中大招寺第一个要拜的师傅是谁': 'c', '论剑中古墓派的终极师傅是谁': 'd', '论剑中花紫会的师傅是谁': 'c', '论剑中青城派的第一个师傅是谁': 'a', '论剑中青城派的终极师傅是谁': 'd', '论剑中逍遥派的终极师傅是谁': 'c', '论剑中以下不是峨嵋派技能的是哪个': 'b', '论剑中以下不是华山派的人物的是哪个': 'd', '论剑中以下哪个不是大理段家的技能': 'c', '论剑中以下哪个不是大招寺的技能': 'b', '论剑中以下哪个不是峨嵋派可以拜师的师傅': 'd', '论剑中以下哪个不是丐帮的技能': 'd', '论剑中以下哪个不是丐帮的人物': 'a', '论剑中以下哪个不是古墓派的的技能': 'b', '论剑中以下哪个不是华山派的技能的': 'd', '论剑中以下哪个不是明教的技能': 'd', '论剑中以下哪个不是魔教的技能': 'a', '论剑中以下哪个不是魔教的人物': 'd', '论剑中以下哪个不是全真教的技能': 'd', '论剑中以下哪个不是是晚月庄的技能': 'd', '论剑中以下哪个不是唐门的技能': 'c', '论剑中以下哪个不是唐门的人物': 'c', '论剑中以下哪个不是铁雪山庄的技能': 'd', '论剑中以下哪个不是铁血大旗门的技能': 'c', '论剑中以下哪个是大理段家的技能': 'a', '论剑中以下哪个是大招寺的技能': 'b', '论剑中以下哪个是丐帮的技能': 'b', '论剑中以下哪个是花紫会的技能': 'a', '论剑中以下哪个是华山派的技能的': 'a', '论剑中以下哪个是明教的技能': 'b', '论剑中以下哪个是青城派的技能': 'b', '论剑中以下哪个是唐门的技能': 'b', '论剑中以下哪个是天邪派的技能': 'b', '论剑中以下哪个是天邪派的人物': 'a', '论剑中以下哪个是铁雪山庄的技能': 'c', '论剑中以下哪个是铁血大旗门的技能': 'b', '论剑中以下哪个是铁血大旗门的师傅': 'a', '论剑中以下哪个是晚月庄的技能': 'a', '论剑中以下哪个是晚月庄的人物': 'a', '论剑中以下是峨嵋派技能的是哪个': 'a', '论语在哪购买': 'a', '骆云舟在哪一章': 'c', '骆云舟在乔阴县的哪个场景': 'b', '落英神剑掌是哪个门派的技能': 'b', '吕进在哪个地图': 'a', '绿宝石加什么属性': 'c', '漫天花雨匕在哪获得': 'a', '茅山的绝学是什么': 'b', '茅山的天师正道可以提升哪个属性': 'd', '茅山可以招几个宝宝': 'c', '茅山派的轻功是什么': 'b', '茅山天师正道可以提升什么': 'c', '茅山学习什么技能招宝宝': 'a', '茅山在哪里拜师': 'c', '每次合成宝石需要多少银两？': 'a', '每个玩家最多能有多少个好友': 'b', '每天的任务次数几点重置': 'd', '每天分享游戏到哪里可以获得20元宝': 'a', '每天能挖几次宝': 'd', '每天能做多少个谜题任务': 'a', '每天能做多少个师门任务': 'c', '每天微信分享能获得多少元宝': 'd', '每天有几次试剑': 'b', '每天在线多少个小时即可领取消费积分？': 'b', '每突破一次技能有效系数加多少': 'a', '密宗伏魔是哪个门派的阵法': 'c', '灭绝师太在第几章': 'c', '灭绝师太在峨眉山哪个场景': 'a', '明教的九阳神功有哪个特殊效果': 'a', '明月帽要多少刻刀摩刻？': 'a', '摹刻10级的装备需要摩刻技巧多少级': 'b', '摹刻烈日宝链需要多少级摩刻技巧？': 'c', '摹刻扬文需要多少把刻刀？': 'a', '魔教的大光明心法可以提升哪个属性': 'd', '莫不收在哪一章': 'a', '墨磷腰带是腰带类的第几级装备？': 'd', '木道人在青城山的哪个场景': 'b', '慕容家主在慕容山庄的哪个场景': 'a', '慕容山庄的斗转星移可以提升哪个属性': 'd', '哪个NPC掉落拆招基础': 'a', '哪个处可以捏脸': 'a', '哪个分享可以获得20元宝': 'b', '哪个技能不是魔教的': 'd', '哪个门派拜师没有性别要求': 'd', '哪个npc属于全真七子': 'b', '哪样不能获得玄铁碎片': 'c', '能增容貌的是下面哪个技能': 'a', '捏脸需要花费多少银两？': 'c', '捏脸需要寻找哪个NPC？': 'a', '欧阳敏是哪个门派的？': 'b', '欧阳敏是哪个门派的师傅': 'b', '欧阳敏在哪一章': 'a', '欧阳敏在唐门的哪个场景': 'c', '排行榜最多可以显示多少名玩家？': 'a', '逄义是在那个场景': 'a', '披星戴月是披风类的第几级装备？': 'd', '劈雳拳套有几个镶孔': 'a', '霹雳掌套的伤害是多少': 'b', '辟邪剑法是哪个门派的绝学技能': 'a', '辟邪剑法在哪学习': 'b', '婆萝蜜多心经是哪个门派的技能': 'b', '七宝天岚舞是哪个门派的技能': 'd', '七星鞭的伤害是多少？': 'c', '七星剑法是哪个门派的绝学': 'a', '棋道是哪个门派的技能': 'c', '千古奇侠称号需要多少论剑积分兑换': 'd', '乾坤大挪移属于什么类型的武功': 'a', '乾坤一阳指是哪个师傅教的': 'a', '青城派的道德经可以提升哪个属性': 'c', '青城派的道家心法有哪个特殊效果': 'a', '清风寨在哪': 'b', '清风寨在哪个地图': 'd', '清虚道长在哪一章': 'd', '去唐门地下通道要找谁拿钥匙': 'a', '全真的道家心法有哪个特殊效果': 'a', '全真的基本阵法有哪个特殊效果': 'b', '全真的双手互搏有哪个特殊效果': 'c', '日月神教大光明心法可以提升什么': 'd', '如何将华山剑法从400级提升到440级？': 'd', '如意刀是哪个门派的技能': 'c', '山河藏宝图需要在哪个NPC手里购买？': 'd', '上山打猎是挂机里的第几个任务': 'c', '少林的混元一气功有哪个特殊效果': 'd', '少林的易筋经神功有哪个特殊效果': 'a', '蛇形刁手是哪个门派的技能': 'b', '首次通过乔阴县不可以获得那种奖励？': 'a', '什么影响打坐的速度': 'c', '什么影响攻击力': 'd', '什么装备不能镶嵌黄水晶': 'd', '什么装备都能镶嵌的是什么宝石？': 'c', '什么装备可以镶嵌紫水晶': 'c', '神雕大侠所在的地图': 'b', '神雕大侠在哪一章': 'a', '神雕侠侣的时代背景是哪个朝代？': 'd', '神雕侠侣的作者是?': 'b', '升级什么技能可以提升根骨': 'a', '生死符的伤害是多少？': 'a', '师门磕头增加什么': 'a', '师门任务每天可以完成多少次？': 'a', '师门任务每天可以做多少个？': 'c', '师门任务什么时候更新？': 'b', '师门任务一天能完成几次': 'd', '师门任务最多可以完成多少个？': 'd', '施令威在哪个地图': 'b', '石师妹哪个门派的师傅': 'c', '使用朱果经验潜能将分别增加多少？': 'a', '首次通过桥阴县不可以获得那种奖励？': 'a', '受赠的消费积分在哪里领取': 'd', '兽皮鞋可以在哪位那里获得？': 'b', '树王坟在第几章节': 'c', '双儿在扬州的哪个小地图': 'a', '孙天灭是哪个门派的师傅': 'c', '踏雪无痕是哪个门派的技能': 'b', '踏云棍可以在哪位那里获得？': 'a', '唐门的唐门毒经有哪个特殊效果': 'a', '唐门密道怎么走': 'c', '天蚕围腰可以镶嵌几颗宝石': 'd', '天蚕围腰是腰带类的第几级装备？': 'd', '天山姥姥在逍遥林的哪个场景': 'd', '天山折梅手是哪个门派的技能': 'c', '天师阵法是哪个门派的阵法': 'b', '天邪派在哪里拜师': 'b', '天羽奇剑是哪个门派的技能': 'a', '铁戒指可以在哪位那里获得？': 'a', '铁血大旗门云海心法可以提升什么': 'a', '通灵需要花费多少银两？': 'd', '通灵需要寻找哪个NPC？': 'c', '突破丹在哪里购买': 'b', '屠龙刀法是哪个门派的绝学技能': 'b', '屠龙刀是什么级别的武器': 'a', '挖剑冢可得什么': 'a', '弯月刀可以在哪位那里获得？': 'b', '玩家每天能够做几次正邪任务': 'c', '玩家想修改名字可以寻找哪个NPC？': 'a', '晚月庄的内功是什么': 'b', '晚月庄的七宝天岚舞可以提升哪个属性': 'b', '晚月庄的小贩在下面哪个地点': 'a', '晚月庄七宝天岚舞可以提升什么': 'b', '晚月庄主线过关要求': 'a', '王铁匠是在那个场景': 'b', '王重阳是哪个门派的师傅': 'b', '魏无极处读书可以读到多少级？': 'a', '魏无极身上掉落什么装备': 'c', '魏无极在第几章': 'a', '闻旗使在哪个地图': 'a', '乌金玄火鞭的伤害是多少？': 'd', '乌檀木刀可以在哪位npc那里获得？': 'd', '钨金腰带是腰带类的第几级装备？': 'd', '武当派的绝学技能是以下哪个': 'd', '武穆兵法提升到多少级才能出现战斗必刷？': 'd', '武穆兵法通过什么学习': 'a', '武学世家加的什么初始属性': 'a', '舞中之武是哪个门派的阵法': 'b', '西毒蛇杖的伤害是多少？': 'c', '吸血蝙蝠在下面哪个地图': 'a', '下列哪项战斗不能多个玩家一起战斗？': 'a', '下列装备中不可摹刻的是': 'c', '下面哪个不是古墓的师傅': 'd', '下面哪个不是门派绝学': 'd', '下面哪个不是魔教的': 'd', '下面哪个地点不是乔阴县的': 'd', '下面哪个门派是正派': 'a', '下面哪个是天邪派的师傅': 'a', '下面有什么是寻宝不能获得的': 'c', '向师傅磕头可以获得什么？': 'b', '逍遥步是哪个门派的技能': 'a', '逍遥林是第几章的地图': 'c', '逍遥林怎么弹琴可以见到天山姥姥': 'b', '逍遥派的绝学技能是以下哪个': 'a', '萧辟尘在哪一章': 'd', '小李飞刀的伤害是多少？': 'd', '小龙女住的古墓是谁建造的？': 'b', '小男孩在华山村哪里': 'a', '新人礼包在哪个npc处兑换': 'a', '新手礼包在哪里领取': 'a', '新手礼包在哪领取？': 'c', '需要使用什么衣服才能睡寒玉床': 'a', '选择孤儿会影响哪个属性': 'c', '选择商贾会影响哪个属性': 'b', '选择书香门第会影响哪个属性': 'b', '选择武学世家会影响哪个属性': 'a', '学习屠龙刀法需要多少内力': 'b', '雪莲有什么作用': 'a', '雪蕊儿是哪个门派的师傅': 'a', '雪蕊儿在铁雪山庄的哪个场景': 'd', '扬文的属性': 'a', '扬州询问黑狗能到下面哪个地点': 'a', '扬州在下面哪个地点的处可以获得玉佩': 'c', '羊毛斗篷是披风类的第几级装备？': 'a', '阳刚之劲是哪个门派的阵法': 'c', '杨过小龙女分开多少年后重逢?': 'c', '杨过在哪个地图': 'a', '夜行披风是披风类的第几级装备？': 'a', '夜皇在大旗门哪个场景': 'c', '一个队伍最多有几个队员': 'c', '一天能完成谜题任务多少个': 'b', '一天能完成师门任务有多少个': 'c', '一天能完成挑战排行榜任务多少次': 'a', '一张分身卡的有效时间是多久': 'c', '一指弹在哪里领悟': 'b', '移开明教石板需要哪项技能到一定级别': 'a', '以下不是步玄派的技能的哪个': 'c', '以下不是天宿派师傅的是哪个': 'c', '以下不是隐藏门派的是哪个': 'd', '以下哪个宝石不能镶嵌到戒指': 'c', '以下哪个宝石不能镶嵌到内甲': 'a', '以下哪个宝石不能镶嵌到披风': 'c', '以下哪个宝石不能镶嵌到腰带': 'c', '以下哪个宝石不能镶嵌到衣服': 'a', '以下哪个不是道尘禅师教导的武学？': 'd', '以下哪个不是何不净教导的武学？': 'c', '以下哪个不是慧名尊者教导的技能？': 'd', '以下哪个不是空空儿教导的武学？': 'b', '以下哪个不是梁师兄教导的武学？': 'b', '以下哪个不是论剑的皮肤？': 'd', '以下哪个不是全真七子？': 'c', '以下哪个不是宋首侠教导的武学？': 'd', '以下哪个不是微信分享好友、朋友圈、QQ空间的奖励？': 'a', '以下哪个不是岳掌门教导的武学？': 'a', '以下哪个不是在雪亭镇场景': 'd', '以下哪个不是在扬州场景': 'd', '以下哪个不是知客道长教导的武学？': 'b', '以下哪个门派不是隐藏门派？': 'c', '以下哪个门派是正派？': 'd', '以下哪个门派是中立门派？': 'a', '以下哪个是步玄派的祖师': 'b', '以下哪个是封山派的祖师': 'c', '以下哪个是花紫会的祖师': 'a', '以下哪个是晚月庄的祖师': 'd', '以下哪些物品不是成长计划第二天可以领取的？': 'c', '以下哪些物品不是成长计划第三天可以领取的？': 'd', '以下哪些物品不是成长计划第一天可以领取的？': 'd', '以下哪些物品是成长计划第四天可以领取的？': 'a', '以下哪些物品是成长计划第五天可以领取的？': 'b', '以下属于邪派的门派是哪个': 'b', '以下属于正派的门派是哪个': 'a', '以下谁不精通降龙十八掌？': 'd', '以下有哪些物品不是每日充值的奖励？': 'd', '倚天剑加多少伤害': 'd', '倚天屠龙记的时代背景哪个朝代？': 'a', '易容后保持时间是多久': 'a', '易容面具需要多少玄铁兑换': 'c', '易容术多少级才可以易容成异性NPC': 'a', '易容术可以找哪位NPC学习？': 'b', '易容术向谁学习': 'a', '易容术在哪里学习': 'a', '易容术在哪学习？': 'b', '银手镯可以在哪位那里获得？': 'b', '银丝链甲衣可以在哪位npc那里获得？': 'a', '银项链可以在哪位那里获得？': 'b', '尹志平是哪个门派的师傅': 'b', '隐者之术是那个门派的阵法': 'a', '鹰爪擒拿手是哪个门派的技能': 'a', '影响你出生的福缘的出生是？': 'd', '油流麻香手是哪个门派的技能': 'a', '游龙散花是哪个门派的阵法': 'd', '玉蜂浆在哪个地图获得': 'a', '玉女剑法是哪个门派的技能': 'b', '岳掌门在哪一章': 'a', '云九天是哪个门派的师傅': 'c', '云问天在哪一章': 'a', '在洛阳萧问天那可以学习什么心法': 'b', '在庙祝处洗杀气每次可以消除多少点': 'a', '在哪个NPC可以购买恢复内力的药品？': 'c', '在哪个处可以更改名字': 'a', '在哪个处领取免费消费积分': 'd', '在哪个处能够升级易容术': 'b', '在哪里可以找到“香茶”？': 'a', '在哪里捏脸提升容貌': 'd', '在哪里消杀气': 'a', '在逍遥派能学到的技能是哪个': 'a', '在雪亭镇李火狮可以学习多少级柳家拳': 'b', '在战斗界面点击哪个按钮可以进入聊天界面': 'd', '在正邪任务中不能获得下面什么奖励？': 'd', '怎么样获得免费元宝': 'a', '赠送李铁嘴银两能够增加什么': 'a', '张教主在明教哪个场景': 'd', '张三丰在哪一章': 'd', '张三丰在武当山哪个场景': 'd', '张松溪在哪个地图': 'c', '张天师是哪个门派的师傅': 'a', '张天师在茅山哪个场景': 'd', '长虹剑在哪位那里获得？': 'a', '正邪任务杀死好人增长什么': 'b', '正邪任务一天能做几次': 'a', '正邪任务中客商的在哪个地图': 'a', '正邪任务中卖花姑娘在哪个地图': 'b', '正邪任务最多可以完成多少个？': 'd', '支线对话书生上魁星阁二楼杀死哪个NPC给10元宝': 'a', '朱姑娘是哪个门派的师傅': 'a', '朱老伯在华山村哪个小地图': 'b', '追风棍可以在哪位npc那里获得？': 'a', '追风棍在哪里获得': 'b', '紫宝石加什么属性': 'd', '下面哪个npc不是魔教的': 'd', '藏宝图在哪里npc那里买': 'a', '从哪个npc处进入跨服战场': 'a', '钻石项链在哪获得': 'a', '在哪个npc处能够升级易容术': 'b', '扬州询问黑狗子能到下面哪个地点': 'a', '北岳殿神像后面是哪位npc': 'b', '兽皮鞋可以在哪位npc那里获得？': 'b', '在哪个npc处领取免费消费积分': 'd', '踏云棍可以在哪位npc那里获得？': 'a', '钢丝甲衣可以在哪位npc那里获得？': 'd', '哪个npc处可以捏脸': 'a', '草帽可以在哪位npc那里获得？': 'b', '铁戒指可以在哪位npc那里获得？': 'a', '银项链可以在哪位npc那里获得？': 'b', '在哪个npc处可以更改名字': 'a', '长剑在哪里可以购买？': 'a', '宝玉帽可以在哪位npc那里获得？': 'd', '论剑中以下哪个不是晚月庄的技能': 'd', '精铁棒可以在哪位npc那里获得？': 'd', '弯月刀可以在哪位npc那里获得？': 'b', 'vip每天不可以领取什么': 'b', '华山施戴子掉落的物品是什么': 'b', '藏宝图在哪个npc处购买': 'b', '宝玉鞋击杀哪个npc可以获得': 'a', '银手镯可以在哪位npc那里获得？': 'b', '莲花掌是哪个门派的技能': 'a', '红宝石加什么属性': 'b', '以下哪个不是在洛阳场景': 'd', '风泉之剑可以在哪位npc那里获得？': 'b', '魔鞭诀在哪里学习': 'd', '副本一次最多可以进几人': 'a', '城里抓贼是挂机里的第几个任务': 'b', '扬州在下面哪个地点的npc处可以获得玉佩': 'c', '白金戒指可以在哪位npc那里获得？': 'b', '长虹剑在哪位npc那里获得？': 'a', '跨服天剑谷是星期几举行的': 'b', '白金手镯可以在哪位npc那里获得？': 'a', '白金项链可以在哪位npc那里获得？': 'b' }
    };

    var SecretPlaceHelper = {
        getDefaultGoal (placeCode) {
            return SecretPlaceHelper._goals[placeCode];
        },

        _goals: {
            'daojiangu': 1538,
            'taohuadu': 1785,
            'lvshuige': 1250,
            'lvzhou': 2035,
            'luanshishan': 2345,
            'dilongling': 2380,
            'fomenshiku': 2425,
            'dafuchuan': 3080,
            'tianlongshan': 3100,
            'binghaigucheng': 3385,
            'baguamen': 3635,
            'nanmanzhidi': 3895,
            'fengduguicheng': 3895,
            'binhaigucheng': 3380
        }
    };

    class SecretPlaceSearch {
        prepare (placeCode, goal) {
            this._placeCode = placeCode;
            this._goal = goal;
            this._stop = false;
        }

        async start () {
            if (this._stop) return true;

            await ButtonManager.click(this._placeCode + '_saodang');
            await ExecutionManager.wait(200);
            let result = $('.out4').text().match('扫荡完成的奖励为：玄铁令x.*?、朱果x(.*?)。')[1];
            debugging('goal=' + this._goal + ', result=' + result);
            if (parseInt(result) >= this._goal) {
                return true;
            } else {
                await ButtonManager.click('cancel_prompt');
                await ExecutionManager.wait(200);
                return this.start();
            }
        }

        stop () {
            debugging('stopping the search.');
            this._stop = true;
        }
    }

    var SecretPlaceSearchManager = {
        _secretPlaceSearch: new SecretPlaceSearch(),
        _customizedGoal: 0,

        setCustomizedGoal (customizedGoal) {
            SecretPlaceSearchManager._customizedGoal = customizedGoal;
        },

        getCustomizedGoal () {
            return SecretPlaceSearchManager._customizedGoal;
        },

        getSecretPlaceSearch () {
            return SecretPlaceSearchManager._secretPlaceSearch;
        }
    };

    var PathManager = {
        getTraversalPathByCity (city) {
            return PathManager._PATHS.TRAVERSAL[city];
        },

        getPathByRoom (room) {
            return PathManager._PATHS.ROOMS[room];
        },

        getPathForSpecificEvent (event) {
            return PathManager._PATHS.OTHER[event];
        },

        getPathByTarget (target) {
            return PathManager._PATHS.NPC[target] || PathManager._PATHS.ROOMS[target];
        },

        getPathForPurchase (target) {
            return PathManager._PATHS._GENERIC_TASK._PURCHASE[target];
        },

        getPathForItemsWithNpcBody (target) {
            return PathManager._PATHS._GENERIC_TASK._BODY[target];
        },

        getPathForFightOrGet (target, specificTarget) {
            debugging('target=' + target + ', specificTarget=' + specificTarget);
            let path = PathManager._PATHS._GENERIC_TASK._FIGHT_OR_GET[target];
            if (path) {
                switch (typeof (path)) {
                    case 'string':
                        return PathManager._PATHS._GENERIC_TASK._FIGHT_OR_GET[target];
                    case 'object':
                        return PathManager._PATHS._GENERIC_TASK._FIGHT_OR_GET[target][specificTarget];
                }
            }
        },

        _PATHS: {
            TRAVERSAL: {
                '雪亭镇': 'jh 1;inn_op1;n;s;w;e;e;w;s;e;s;w;w;e;s;n;e;e;ne;ne;sw;sw;n;w;n;w;e;e;e;n;s;e;e;n;s;s;n;e;w;w;w;w;w;n;w;e;n;w;e;e;e;w;w;n;w;e;e;w;n',
                '洛阳': 'jh 2;n;n;e;s;luoyang317_op1;n;n;w;n;w;putuan;n;e;e;s;n;w;n;e;s;n;w;w;s;w;e;n;event_1_98995501;n;w;e;n;e;w;s;s;s;e;n;w;s;luoyang111_op1;e;n;n;n;w;e;s;s;w;n;w;get_silver;s;e;n;n;e;get_silver;n;w;s;s;s;e;e;e;n;op1;s;s;e;n;n;w;e;e;n;s;w;n;w;e;n;e;w;n;w;e;s;s;s;s;s;w;w;n;w;e;e;n;s;w;n;e;w;n;w;luoyang14_op1;n;e;e;w;n;e;n;n;s;s;w;n;n;n;n;',
                '华山村': 'jh 3;n;e;w;s;w;n;s;e;s;e;n;s;w;s;e;s;huashancun24_op2;w;n;w;w;n;s;e;s;s;w;n;s;e;s;e;w;nw;jh 3;w;event_1_59520311;n;n;w;get_silver;s;e;n;n;e;get_silver;n;w;n;e;w;s;s;s;s;s;e;e',
                '华山': 'jh 4;n;n;w;e;n;e;w;n;n;n;e;n;n;event_1_91604710;s;s;s;w;e;s;e;w;n;n;n;n;nw;s;s;w;n;n;s;n;w;w;n;get_xiangnang2;w;s;e;e;n;n;w;e;n;n;w;e;e;n;n;s;s;s;s;n;n;w;n;get_silver;s;s;s;s;s;e;n;n;w;e;n;e;w;n;e;w;n;s;s;s;s;s;w;n;w;event_1_30014247;s;w;e;s;e;w;s;s;s;e',
                '扬州': 'jh 5;n;e;#3 w;n;s;e;e;n;e;w;w;e;n;w;e;n;w;yangzhou16_op1;e;e;n;w;w;s;s;#5 n;s;e;w;w;#3 n;#3 s;e;s;s;#3 e;#3 n;s;s;w;#3 n;e;n;n;s;s;e;s;s;w;n;ns;s;e;s;w;s;w;n;w;e;e;n;n;w;get_silver;s;e;e;w;n;n;#4 s;w;n;w;e;e;get_silver;s;w;n;w;w;n;get_silver;s;s;w;#3 e;n;e;s;e;#3 s;#3 n;w;n;w;n;ne;sw;s;w;s;n;w;n;e;w;w;e;n;n;w;n;s;e;e;s;n;w;n',
                '丐帮': 'jh 6;event_1_98623439;s;w;e;n;ne;ne;ne;sw;sw;n;ne;ne;ne;event_1_97428251',
                '乔阴县': 'jh 7;#3 s;w;s;#3 w;#4 e;event_1_65599392;w;e;n;s;ne;s;s;e;n;n;e;w;s;s;w;s;#3 w;n;s;s;e;n;s;e;ne;s;e;n;e;s;e',
                '恒山': 'jh 9;n;w;e;n;e;get_silver;w;w;n;w;e;n;e;w;henshan15_op1;e;n;event_1_85624865;n;w;e;e;w;n;n;henshan_zizhiyu11_op1;e;n;#4 s;w;n;n;w;n;s;s;n;#3 e;w;n;s;w;n;n;w;n;e;henshan_qinqitai23_op1;s;w;n;n;n;s;w;get_silver',
                '武当山': 'jh 10;w;n;n;#3 w;#5 n;w;n;s;#5 e;w;w;s;n;w;w;#4 n;#5 s;#4 e;s;e;s;e;n;s;s;n;e;e;n;s;e;w;#3 s',
                '晚月庄': 'jh 11;s;e;s',
                '水烟阁': 'jh 12;n;e;w;#3 n;s;w;n;n;e;w;s;nw;e;n;s;e;sw;n;s;s;e',
                '少林寺': 'jh 13;e;s;s;w;w;w;e;e;n;n;w;n;w;w;n;shaolin012_op1;s;s;e;e;n;w;e;e;w;n;n;w;e;e;w;n;n;w;e;e;w;n;shaolin27_op1;event_1_34680156;s;w;n;w;e;e;w;n;shaolin25_op1;w;n;w;#8 s;#8 n;e;e;#8 s;#8 n;w;n;w;e;e;w;n;w;n;get_silver',
                '唐门': 'jh 14;w;#4 n;s;#4 w;e;n;s;s;n;e;n;s;s;n;e;n;s;s;n;e;e;s;n;e;n;e;w;n;n;s;#3 ask tangmen_tangmei;e;event_1_8413183;event_1_39383240;e;s;e;n;w;n;n;s;s;jh 14;e;event_1_10831808;n;s;s;w;sw;s;e;s;s;sw;sw;w;w;s;s;e',
                '逍遥林': 'jh 16;#4 s;e;e;s;w;n;#3 s;n;n;w;n;n;#4 s;n;n;w;w;n;s;s;n;w;#6 e;n;n;e;event_1_5221690;s;w;event_1_57688376;n;n;w;n;s;w;#3 e;n;s;e;n;n;w;n;e',
                '开封': 'jh 17;n;w;e;e;s;n;w;n;w;n;n;#3 s;n;#3 e;s;#3 n;s;get_silver;e;s;w;#3 s;w;e;s;w;e;n;e;n;s;s;n;e;e;#3 w;#3 n;w;n;e;w;n;e;#3 w;n;s;s;n;w;s;s;w;e;#4 n;w;e;s;s;w;#4 e;n;e;#3 n;event_1_27702191;w;#3 s;w;#5 s;e;#3 s;e;kaifeng_yuwangtai23_op1;s;w;s;s;w;e;#5 n;w;event_1_97081006;#5 s;w;w;e;kaifeng_yezhulin05_op1;s;e;n;n;e;kaifeng_yezhulin23_op1;jh 17;sw;nw;se;s;sw;nw;ne;event_1_38940168',
                '光明顶': 'jh 18;e;w;w;n;s;e;n;nw;sw;ne;n;n;w;e;#3 n;ne;n;n;w;e;e;w;n;w;e;e;w;#4 n;e;w;n;e;w;w;e;n;w;nw;nw;se;se;w;#4 s;n;e;e;n;w;#3 e;s;w;e;se;se;e;w;nw;nw;n;n;ne;sw;n;w;w;#3 n;w;e;n;event_1_90080676;event_1_56007071;nw;ne;n;nw',
                '全真教': 'jh 19;#3 s;sw;s;e;n;nw;#4 n;e;w;w;e;n;#3 w;s;n;w;s;n;#5 e;n;s;e;e;w;n;n;s;s;w;w;n;n;w;w;s;s;n;n;w;s;s;n;n;w;#4 n;e;n;#3 s;e;n;n;w;e;e;s;s;n;n;e;n',
                '古墓': 'jh 20;w;w;s;e;#5 s;sw;sw;s;s;e;w;#4 s',
                '白驼山': 'jh 21;#4 n;#4 s;nw;s;n;w;n;s;w;nw;e;w;nw;nw;n;w;sw;jh 21;nw;w;w;nw;n;e;w;n;n;w;e;n;n;e;e;w;ne;sw;e;se;nw;w;n;s;s;n;w;w;#4 n;#3 s;#4 e;n;n;e;e;w;w;w;e;n;nw;se;ne;e;w;n;jh 21;nw;ne;ne;sw;n;n;ne;w;e;n;n;w;w',
                '碧海山庄': 'jh 38;n;n;w;e;n;n;w;w;e;e;#3 n;w;w;nw;w;e;se;e;e;n;n;e;se;s;e;w;n;nw;w;n;n;e;e;se;se;e;#3 n;#3 s'
            },

            NPC: {
                '柳绘心': 'jh 1;e;n;#4 e;n',
                '王铁匠': 'jh 1;e;n;n;w',
                '杨掌柜': 'jh 1;e;#3 n;w',
                '柳小花': 'jh 2;#4 n;w;s;w',
                '卖花姑娘': 'jh 2;#7 n',
                '客商': 'jh 2;n;n;e',
                '刘守财': 'jh 2;#7 n;e',
                '方老板': 'jh 3;s;s;e',
                '方寡妇': 'jh 3;s;s;w;n',
                '朱老伯': 'jh 3;s;s;w'
            },

            _GENERIC_TASK: {
                _PURCHASE: {
                    '雪亭镇-饮风客栈-店小二': 'jh 1',
                    '雪亭镇-桑邻药铺-杨掌柜': 'jh 1;e;#3 n;w',
                    '雪亭镇-打铁铺子-王铁匠': 'jh 1;e;n;n;w;buy snow_smith',
                    '洛阳-北大街-卖花姑娘': 'jh 2;#7 n',
                    '洛阳-猪肉摊-郑屠夫': 'jh 2;#4 n;e;s',
                    '扬州-至止堂-朱先生': 'jh 5;#5 n;e;#3 n;buy yangzhou_yangzhou17',
                    '青城山-四季花店-小甜': 'jh 15;#3 s;e;buy qingcheng_flowboss',
                    '青城山-书院-读千里': 'jh 15;#4 s;e',
                    '星宿海-杂货铺-买卖提': 'jh 28;nw;w',
                    '乔阴县-火龙将军庙-乾瘪老太婆': 'jh 7;#7 s;sw;w',
                    '乔阴县-福林大街-卖饼大叔': 'jh 7;s',
                    '青城山-小径-游方郎中': 'jh 15;n',
                    '大昭寺-迎梅客栈-店老板': 'jh 26;#6 w;s;e',
                    '青城山-小肉铺-屠夫': 'jh 15;s;s;e',

                    '峨眉山-千佛庵大门-小贩': 'find_family_quest_road;find_clan_quest_road'
                },

                _BODY: {
                    '雪亭镇-木屋-花不为': 'jh 1;e;#4 n;e',
                    '雪亭镇-雪亭镇街道-农夫': 'jh 1;e;s;w',
                    '洛阳-*银钩赌坊*-雅舍-玉娘': 'jh 2;#5 n;w;w;#3 n;e',
                    '洛阳-桃花别院-红娘': 'jh 2;#4 n;w;s',
                    '洛阳-*白冢*-观景台-护卫': 'jh 2;#5 n;e;e;n;n;w',
                    '洛阳-城楼-守城武将': 'jh 2;#8 n',
                    '明教-巨石-明教小圣使': 'jh 18;n;nw;#5 n',
                    '明教-民居-村妇': 'jh 18;w',
                    '华山村-石板桥-黑狗': 'jh 3;#3 s',
                    '华山村-*土地庙*-庙堂-抠脚大汉': 'jh 3;w;event_1_59520311;n',
                    '华山村-茶棚-王老二': 'jh 3;w;n',
                    '华山-*落雁崖*-草丛小路-史老三': 'jh 4;#9 n;e;n;n',
                    '华山-*武器库*-秘道1-华山弟子': 'find_family_quest_road;find_clan_quest_road',
                    '丐帮-储藏室-何一河': 'jh 6;event_1_98623439;s',
                    '白驮山-药房-小青': 'jh 21;nw;w;w;nw;#5 n;w;s',
                    '白驮山-山路-樵夫': 'jh 21;nw;w;w;#3 nw',
                    '白驮山-小桥-村姑': 'jh 21;nw;w;w',
                    '白驮山-东街': 'jh 21;nw',
                    '雪亭镇-桑邻药铺-樵夫': 'jh 1;e;#3 n;w',
                    '铁雪山庄-羊肠小道-樵夫': 'jh 31;#3 n',
                    '少林寺-少林寺山门-虚明': 'jh 13;n',
                    '少林寺-月台-托钵僧': 'jh 13;#6 n',
                    '武当山-藏经阁-道童': 'jh 10;w;n;n;#3 w;#5 n;w;n',
                    '大昭寺-八角街-樵夫': 'jh 26;#6 w;s;s;#4 w',
                    '断剑山庄-下棋亭-黑袍老人': 'jh 34;ne;#5 e;n;e;n',
                    '断剑山庄-下棋亭-白袍老人': 'jh 34;ne;#5 e;n;e;n',
                    '断剑山庄-小船-摆渡老人': 'find_family_quest_road;find_clan_quest_road',
                    '晚月庄-禁闭房-芳绫': 'jh 11;s;e;s;sw;se;w;w;n;w',
                    '晚月庄-晚月庄大厅-婢女': 'jh 11;s;e;s;sw;se;w',
                    '乔阴县-福林酒楼-贵公子': 'jh 7;#6 s;e;n',
                    '乔阴县-曲桥-书生': 'jh 7;#8 s;e',
                    '乔阴县-火龙将军庙-妇人': 'jh 7;#7 s;sw;w;n',
                    '大旗门-蓝室-蓝衣少女': 'find_family_quest_road;find_clan_quest_road',
                    '全真教-肥料房-老人': 'jh 19;#3 s;sw;s;e;n;nw;#14 n',
                    '全真教-终南石阶-终南山游客': 'jh 19;#3 s;sw;s;e;n',
                    '全真教-万物堂-程遥伽': 'jh 19;#3 s;sw;s;e;n;nw;#4 n',
                    '青城山-福州官衙-福州府尹': 'jh 19;#5 s;e',
                    '白驮山-洞口-山贼': 'jh 21;nw;ne;n;n;ne;n',
                    '星宿海-天山下-波斯商人': 'jh 28',
                    '星宿海-天山山路-星宿派鼓手': 'jh 28;n;n',
                    '星宿海-天山山路-采药人': 'jh 28;n;w;w',
                    '星宿海-赛马场-阿拉木罕': 'jh 28;nw;nw',
                    '慕容山庄-雅致大厅-慕容老夫人': 'jh 32;n;n;se;n',
                    '慕容山庄-小舟-碧姑娘': 'find_family_quest_road;find_clan_quest_road',
                    '断剑山庄-花路-栽花老人': 'find_family_quest_road;find_clan_quest_road'
                },

                _FIGHT_OR_GET: {
                    '扬州-*扬州官衙*-内室': 'find_family_quest_road;find_clan_quest_road',
                    '古墓-树上': 'find_family_quest_road;find_clan_quest_road',
                    '古墓-小屋': 'find_family_quest_road;find_clan_quest_road',
                    '峨眉山-峨眉后山': 'find_family_quest_road;find_clan_quest_road',
                    '峨眉山-风动坡': 'find_family_quest_road;find_clan_quest_road',
                    '峨眉山-饭堂': 'find_family_quest_road;find_clan_quest_road',
                    '峨眉山-雷动坪': 'find_family_quest_road;find_clan_quest_road',
                    '峨眉山-归云阁': 'find_family_quest_road;find_clan_quest_road',
                    '峨眉山-千佛庵大门': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-留云馆': 'find_family_quest_road;find_clan_quest_road',
                    '慕容山庄-小舟': 'find_family_quest_road;find_clan_quest_road',
                    '寒梅庄-*湖底地牢*-地道3': 'find_family_quest_road;find_clan_quest_road',
                    '魔教-内室': 'find_family_quest_road;find_clan_quest_road',
                    '魔教-内堂': 'find_family_quest_road;find_clan_quest_road',
                    '唐门-地下通道': 'find_family_quest_road;find_clan_quest_road',
                    '唐门-石室': 'find_family_quest_road;find_clan_quest_road',
                    '唐门-梁上': 'find_family_quest_road;find_clan_quest_road',
                    '晚月庄-内厅': 'find_family_quest_road;find_clan_quest_road',
                    '晚月庄-密室': 'find_family_quest_road;find_clan_quest_road',
                    '断剑山庄-花路': 'find_family_quest_road;find_clan_quest_road',
                    '断剑山庄-小船': 'find_family_quest_road;find_clan_quest_road;yell',
                    '青城山-侧房': 'find_family_quest_road;find_clan_quest_road',
                    '全真教-会真堂': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-黄室': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-橙室': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-青室': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-紫室': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-蓝室': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-红室': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-绿室': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-观月顶': 'find_family_quest_road;find_clan_quest_road',
                    '大旗门-谷内小径': 'find_family_quest_road;find_clan_quest_road',
                    '大理-半山竹林': 'find_family_quest_road;find_clan_quest_road',
                    '大理-沿池堤岸': 'find_family_quest_road;find_clan_quest_road',
                    '大理-长廊': 'find_family_quest_road;find_clan_quest_road',
                    '大理-杆栏中层': 'find_family_quest_road;find_clan_quest_road',
                    '大理-祭祀屋': 'find_family_quest_road;find_clan_quest_road',
                    '大理-厨房': 'find_family_quest_road;find_clan_quest_road',
                    '逍遥林-房间': 'find_family_quest_road;find_clan_quest_road',
                    '逍遥林-石室': 'find_family_quest_road;find_clan_quest_road',
                    '魔教-神教监牢': 'find_family_quest_road;find_clan_quest_road',
                    '桃花岛-废屋': 'find_family_quest_road;find_clan_quest_road',
                    '魔教-侧厅': 'find_family_quest_road;find_clan_quest_road',
                    '古墓-剑室': 'find_family_quest_road;find_clan_quest_road',
                    '青城山-密室': 'find_family_quest_road;find_clan_quest_road',
                    '白驮山-密道': 'find_family_quest_road;find_clan_quest_road',

                    '雪亭镇-饮风客栈': 'jh 1',
                    '雪亭镇-雪亭镇街道': {
                        '农夫': 'jh 1;e;s;w',
                        '老农夫': 'jh 1;e;s;w',
                        '醉汉': 'jh 1;e;n;n',
                        '收破烂的': 'jh 1;e;n;n'
                    },
                    '雪亭镇-广场': 'jh 1;e',
                    '雪亭镇-青石官道': 'jh 1;e;s;w;w',
                    '雪亭镇-淳风武馆教练场': 'jh 1;e;n;e;e',
                    '雪亭镇-兵器储藏室': 'jh 1;e;n;e;e;n',
                    '雪亭镇-广场-苦力': 'jh 1;e',
                    '雪亭镇-打铁铺子': 'jh 1;e;n;n;w',
                    '雪亭镇-木屋': 'jh 1;e;#4 n;e',
                    '雪亭镇-雪亭驿': 'jh 1;e;#3 n;w',
                    '雪亭镇-黄土小径': 'jh 1;e;e;s;ne',
                    '雪亭镇-城隍庙': 'jh 1;e;e',
                    '雪亭镇-淳风武馆大门': 'jh 1;e;n;e',
                    '雪亭镇-桑邻药铺': 'jh 1;e;#3 n;w',
                    '洛阳-洛神庙': 'jh 2;#3 n;w',
                    '洛阳-中心鼓楼': 'jh 2;#5 n',
                    '洛阳-金刀门': 'jh 2;#3 n;e',
                    '洛阳-北郊小路': 'jh 2;#9 n',
                    '洛阳-猪肉摊': 'jh 2;#4 n;e;s',
                    '洛阳-绿竹林': 'jh 2;#9 n;e',
                    '洛阳-桃花别院': 'jh 2;#4 n;w;s',
                    '洛阳-牡丹亭': 'jh 2;#5 n;w;s;luoyang111_op1',
                    '洛阳-牡丹园': 'jh 2;#5 n;w;s',
                    '洛阳-钱庄': 'jh 2;n;n;n;n;n;n;n;e',
                    '洛阳-*白冢*-草屋': 'jh 2;#5 n;e;e;n;n;e;n',
                    '洛阳-*白冢*-水榭': 'jh 2;#5 n;e;e;n',
                    '洛阳-*白冢*-观景台': 'jh 2;#5 n;e;e;n;n;w',
                    '洛阳-*白冢*-白公墓': 'jh 2;#5 n;e;e;#5 n',
                    '洛阳-*银钩赌坊*-雅舍': 'jh 2;#5 n;w;w;#3 n;e',
                    '洛阳-*银钩赌坊*-赌坊后门': 'jh 2;#4 n;w;event_1_98995501;n;n;e',
                    '洛阳-*背阴巷*-酒肆': '',
                    '洛阳-问鼎街': 'jh 2;#5 n;w',
                    '洛阳-城楼': 'jh 2;#8 n',
                    '洛阳-城楼密室': 'jh 2;#8 n;w;luoyang14_op1',
                    '华山村-山脚': 'jh 3;#5 s;nw',
                    '华山村-松林小径': 'jh 3;n',
                    '华山村-青石街': 'jh 3;s',
                    '华山村-神女冢': 'jh 3;n;e',
                    '华山村-杏林': 'jh 3;w',
                    '华山村-石板桥': 'jh 3;#3 s',
                    '华山村-华山村村口': 'jh 3',
                    '华山村-*土地庙*-地道入口': 'jh 3;w;event_1_59520311;n;n',
                    '华山村-打铁铺': 'jh 3;s;e;n',
                    '华山村-银杏广场': 'jh 3;s;s',
                    '华山村-田间小路': 'jh 3;#4 s',
                    '华山村-*清风寨*-蜿蜒山径': 'jh 3;#5 s;nw;n',
                    '华山村-*清风寨*-山脚': 'jh 3;#5 s;nw',
                    '华山村-杂草小路': 'jh 3;#5 s',
                    '华山-后院': 'jh 4;#12 n',
                    '华山-厨房': 'jh 4;#12 n;w',
                    '华山-*武器库*': {
                        '秘道1': 'jh 4;#10 n;w;event_1_30014247;s;w',
                        '库房通道1': 'jh 4;#10 n;w;event_1_30014247;s',
                        '库房通道2': 'jh 4;#10 n;w;event_1_30014247;s;s',
                        '秘道2': 'jh 4;#10 n;w;event_1_30014247;s;s;e',
                        '库房': 'jh 4;#10 n;w;event_1_30014247;#3 s',
                        '地道入口': 'jh 4;#10 n;w;event_1_30014247;#4 s',
                        '暗黑地道': 'jh 4;#10 n;w;event_1_30014247;#5 s',
                        '密室': 'jh 4;#10 n;w;event_1_30014247;#5 s;e'
                    },
                    '华山-崎岖山路': 'jh 4;#6 n;e;n;n;event_1_91604710',
                    '华山-*天声峡*-崎岖山路': 'jh 4;#6 n;e;n;n;event_1_91604710',
                    '华山-*落雁崖*-长空栈道': 'jh 4;#9 n;e',
                    '华山-松林石径': 'jh 4;#8 n',
                    '扬州-彦明钱庄': 'jh 5;#4 n;w',
                    '扬州-十里长街3': 'jh 5;n;n',
                    '扬州-十里长街6': 'jh 5;#8 n',
                    '扬州-虹桥': 'jh 5;#8 n;w',
                    '扬州-东关街': 'jh 5;#9 n;e',
                    '扬州-武庙': 'jh 5;#6 n;w',
                    '丐帮-储藏室': 'jh 6;event_1_98623439;s',
                    '丐帮-暗道': 'jh 6;event_1_98623439;ne;ne',
                    '乔阴县-福林大街': {
                        '卖包子的': 'jh 7;#3 s',
                        '卖饼大叔': 'jh 7;#3 s'
                    },
                    '乔阴县-树王坟内部': 'jh 7;#3 s;w;s;#3 w;#4 e;event_1_65599392;n',
                    '乔阴县-福林酒楼': {
                        '贵公子': 'jh 7;#6 s;e;n',
                        '家丁': 'jh 7;#6 s;e;n',
                        '武官': 'jh 7;#6 s;e',
                        '汤掌柜': 'jh 7;#6 s;e'
                    },
                    '乔阴县-火龙将军庙': {
                        '妇人': 'jh 7;#7 s;sw;w;n',
                        '乾瘪老太婆': 'jh 7;#7 s;sw;w'
                    },
                    '乔阴县-曲桥': {
                        '官家小姐': 'jh 7;#8 s;e;n;e',
                        '丫鬟': 'jh 7;#8 s;e;n;e',
                        '书生': 'jh 7;#8 s;e'
                    },
                    '恒山-长廊': 'jh 9;#8 n',
                    '恒山-鸡叫石': 'jh 9;#3 n;w',
                    '恒山-见性峰山道': 'jh 9;#5 n',
                    '恒山-秘道': 'jh 9;#4 n;henshan15_op1',
                    '恒山-斋堂': 'jh 9;#7 n;w;n',
                    '武当山-茶室': 'jh 10;w;n;n;#3 w;#5 n;e;e;s',
                    '武当山-练功房': 'jh 10;w;n;n;#3 w;#5 n;#3 e',
                    '武当山-武当牌坊': 'jh 10;w;n;n;w;w',
                    '武当山-黄土路': 'jh 10;w;n;n;w',
                    '武当山-桃园小路': {
                        '小蜜蜂': 'jh 10;w;n;n;#3 w;#4 n;#4 e;s;e;s;e;n',
                        '蜜蜂': 'jh 10;w;n;n;#3 w;#4 n;#4 e;s;e;s;e;n',
                        '猴子': 'jh 10;w;n;n;#3 w;#4 n;#4 e;s;e;s;e;s'
                    },
                    '武当山-藏经阁': 'jh 10;w;n;n;#3 w;#5 n;w;n',
                    '晚月庄-蜿蜒小径': 'jh 11;s;e;s',
                    '晚月庄-竹林': 'jh 11;e',
                    '晚月庄-禁闭房': 'jh 11;s;e;s;sw;se;w;w;n;w',
                    '少林寺-丛林山径': 'jh 13',
                    '少林寺-土路': 'jh 13;n;w',
                    '少林寺-藏经阁': 'jh 13;#7 n',
                    '少林寺-立雪亭': 'jh 13;#10 n',
                    '少林寺-方丈院': 'jh 13;#8 n',
                    '唐门-唐门厨房': 'jh 14;w;#3 n;e;s',
                    '唐门-授艺亭': 'jh 14;w;#3 n;e;e;n;e',
                    '青城山-北郊': 'jh 15',
                    '青城山-镖局车站': 'jh 15;#3 s;w;w;n',
                    '青城山-练武场': 'jh 15;#3 s;w;w;s;s',
                    '青城山-福州大街': 'jh 15;s;s',
                    '青城山-酒家二楼': 'jh 15;s;s;w;n',
                    '青城山-小肉铺': 'jh 15;s;s;e',
                    '青城山-无醉酒家': 'jh 15;s;s;w',
                    '逍遥林-小木屋': 'jh 16;#4 s;e;e;s;w;n;s;w;n;n',
                    '逍遥林-湖边': 'jh 16;#4 s;e;n;e;event_1_5221690;s;w',
                    '逍遥林-打铁屋': 'jh 16;#4 s;e;e;s;#4 w;n',
                    '逍遥林-工匠屋': 'jh 16;#4 s;e;e;s;w;s;s',
                    '逍遥林-林间小道': {
                        '石师妹': 'jh 16;#4 s;e;e;s;w;n;s;w;n'
                    },
                    '开封-羊肠小道': 'jh 17;event_1_97081006',
                    '开封-*野猪林*-杂草小路': 'jh 17;event_1_97081006;#5 s;w',
                    '开封-朱雀门': 'jh 17',
                    '开封-柳树林': 'jh 17;#5 n;e;#3 n',
                    '开封-杂草小路': 'jh 17;event_1_97081006;s',
                    '开封-*野猪林*-荆棘丛': 'jh 17;event_1_97081006;#4 s',
                    '开封-*野猪林*-羊肠小道': 'jh 17;event_1_97081006',
                    '开封-*野猪林*-破烂小屋': 'jh 17;event_1_97081006;#5 s;w;kaifeng_yezhulin05_op1',
                    '明教-卧房': 'jh 18;w;n',
                    '明教-民居': 'jh 18;w',
                    '明教-巨石': 'jh 18;n;nw;#5 n',
                    '明教-小饭厅': 'jh 18;e;w;w;n;s;e;n;nw;sw;ne;n;n;w;e;#3 n;ne;#9 n;w;nw',
                    '明教-打坐室': 'jh 18;e;w;w;n;s;e;n;nw;sw;ne;n;n;w;e;#3 n;ne;#8 n;e',
                    '全真教-终南石阶': {
                        '男童': 'jh 19;#3 s;sw;s;e;n;nw',
                        '终南山游客': 'jh 19;#3 s;sw;s;e;n'
                    },
                    '全真教-大堂一进': 'jh 19;#3 s;sw;s;e;n;nw;#11 n;#3 e;n',
                    '全真教-后堂一进': 'jh 19;#3 s;sw;s;e;n;nw;#7 n;#3 w;s',
                    '全真教-藏经殿': 'jh 19;#3 s;sw;s;e;n;nw;#8 n;w',
                    '全真教-授经楼': 'jh 19;#3 s;sw;s;e;n;nw;#8 n;e;s',
                    '古墓-蜂屋': 'jh 20;w;w;s;e;#5 s;sw;sw;#6 s',
                    '古墓-草地': 'jh 20;w;w;s;e;#5 s;sw;sw;s',
                    '古墓-悬崖': 'jh 20;w;w;s;e;#5 s;sw;sw;s;s;e',
                    '白驮山-小桥': 'jh 21;nw;w;w',
                    '白驮山-打铁铺': 'jh 21;nw;s',
                    '白驮山-大门': 'jh 21;nw;w;w;nw;n;n',
                    '白驮山-广场': 'jh 21;nw;w;w;nw',
                    '白驮山-花园': 'jh 21;nw;w;w;nw;#7 n',
                    '白驮山-草丛': 'jh 21;nw;w;w;nw;#5 n;#4 w',
                    '白驮山-厨房': 'jh 21;nw;w;w;nw;#7 n;e',
                    '白驮山-柴房': 'jh 21;nw;w;w;nw;#7 n;e;e',
                    '白驮山-练功室': 'jh 21;nw;w;w;nw;#5 n;e;ne',
                    '白驮山-药房': 'jh 21;nw;w;w;nw;#5 n;w;s',
                    '白驮山-洞口': 'jh 21;nw;ne;n;n;ne;n',
                    '白驮山-小路': {
                        '小山贼': 'jh 21;nw;ne;n;n',
                        '农民': 'jh 21;nw;ne;n;n',
                        '山贼': 'jh 21;nw;ne;n;n;ne'
                    },
                    '嵩山-嵩岳山道': 'jh 22;n;n;w;n',
                    '嵩山-魔云洞口': 'jh 22;n;n;w;w;s',
                    '嵩山-*魔云洞*-魔云洞口': 'jh 22;n;n;w;w;s',
                    '嵩山-山楂林': 'jh 22;n;n;w;#5 n',
                    '寒梅庄-百木园': 'jh 23;#7 n',
                    '泰山-石板路': 'jh 24;#4 n',
                    '泰山-桃花路': 'jh 24;#12 n;w;n',
                    '大旗门-小路': 'jh 11;n;e;s;n;nw;w;nw;e',
                    '大旗门-海边路': 'jh 25;#3 e',
                    '大旗门-海边': 'jh 25;#5 e;s',
                    '大旗门-危崖前': 'jh 25;w',
                    '大昭寺-八角街': {
                        '野狗': 'jh 26;#6 w;s;s;#4 w',
                        '樵夫': 'jh 26;#6 w;s;s;#4 w',
                        '收破烂的': 'jh 26;#6 w;s;s;#4 w',
                        '破剑': 'jh 26;#6 w;s;s;#4 w',
                        '木禅杖': 'jh 26;#6 w;s;s;#4 w',
                        '舍利子': 'jh 26;#6 w;s;s;#4 w',
                        '乞丐': 'jh 26;#6 w;s;s;#4 w;n',
                        '破弯刀': 'jh 26;#6 w;s;s;#4 w;n',
                        '垃圾': 'jh 26;#6 w;s;s;#4 w;n',
                        '疯狗': 'jh 26;#6 w;s;s;#4 w;#5 n;#3 e'
                    },
                    '大昭寺-驿站': 'jh 26;#6 w;s;w',
                    '大昭寺-宝塔': 'jh 26;#9 w',
                    '大昭寺-草原': {
                        '小绵羊': 'jh 26',
                        '大绵羊': 'jh 26;w;w',
                        '小羊羔': 'jh 26;#3 w'
                    },
                    '魔教-子午楼': 'jh 27;ne;w',
                    '星宿海-天山山路': {
                        '牧羊人': 'jh 28;n',
                        '采药人': 'jh 28;n;w;w',
                        '星宿派钹手': 'jh 28;n;n'
                    },
                    '星宿海-伊犁': 'jh 28;nw',
                    '星宿海-巴依家院': 'jh 28;nw;e',
                    '星宿海-巴依家客厅': 'jh 28;nw;e;e',
                    '星宿海-百龙山': 'jh 28;n;#4 w;n',
                    '星宿海-储藏室': 'jh 28;n;w;n;n;se',
                    '星宿海-小路': 'jh 28;n;w;n;n',
                    '茅山-山道': {
                        '野猪': 'jh 29;n'
                    },
                    '茅山-三清宫厨房': 'jh 29;#4 n;#3 event_1_60035830;event_1_65661209;#7 n;event_1_98579273;e',
                    '茅山-三清宫储藏室。': 'jh 29;#4 n;#3 event_1_60035830;event_1_65661209;#7 n;event_1_98579273;n;e',
                    '桃花岛-兵器室': 'jh 30;#10 n;w;w',
                    '桃花岛-青草地': 'jh 30;#13 n;e;e',
                    '铁雪山庄-练功室': 'jh 31;#3 n;#4 w;#4 n;w',
                    '铁雪山庄-羊肠小道': 'jh 31;#3 n',
                    '铁雪山庄-翠竹屋': 'jh 31;#3 n;#4 w;#3 n',
                    '慕容山庄-云锦二楼': 'jh 32;n;n;se;#4 n;#3 w;n;w;n;e;n;e;n;n',
                    '慕容山庄-山庄门口': 'jh 32;n;n',
                    '慕容山庄-雅致大厅': 'jh 32;n;n;se;n',
                    '慕容山庄-白曲湖': 'jh 32;n;n;se;#4 n;#3 w;n;w',
                    '大理-村外草坡': 'jh 33;sw;sw;#3 s;nw;n;nw;#4 n;e;~村外草坡',
                    '大理-兵营': 'jh 33;sw;sw;#8 s;w;s',
                    '大理-碧鸡山顶': 'jh 33;sw;sw;#4 s;#4 e;se;s;e',
                    '大理-剑川镇': 'jh 33;sw;sw;#3 s;nw;n;nw;n',
                    '大理-茶花山': 'jh 33;sw;sw;#4 s;e;e',
                    '大理-渔家': 'jh 33;sw;sw;#14 s;se;sw;w',
                    '大理-议事厅': 'jh 33;sw;sw;#8 s;w;n;se;ne',
                    '大理-议事堂': 'jh 33;sw;sw;#14 s;e;n;n',
                    '大理-农田': 'jh 33;sw;sw;#13 s;sw;sw;s',
                    '断剑山庄-下棋亭': 'jh 34;ne;#5 e;n;e;n'
                }
            },

            ROOMS: {
                '书房': 'jh 1;e;n;e;e;e;e;n',
                '打铁铺子': 'jh 1;e;n;n;w',
                '桑邻药铺': 'jh 1;e;n;n;n;w',
                '南市': 'jh 2;n;n;e',
                '钱庄': 'jh 2;n;n;n;n;n;n;n;e',
                '绣楼': 'jh 2;n;n;n;n;w;s;w',
                '北大街': 'jh 2;n;n;n;n;n;n;n',
                '石板桥': 'jh 3;s;s;s',
                '杂货铺': 'jh 3;s;s;e',
                '祠堂大门': 'jh 3;s;s;w',
                '厅堂': 'jh 3;s;s;w;n',

                '桃花泉': 'jh 3;#5 s;nw;n;n;e',
                '潭畔草地': 'jh 4;#7 n;event_1_91604710;s;s;s',
                '千尺幢': 'jh 4;#4 n',
                '玉女峰': 'jh 4;#8 n;w',
                '山坳': 'jh 1;e;#5 n',
                '九老洞': 'jh 8;w;nw;n;#4n;e;e;n;n;e',
                '猢狲愁': 'jh 4;#6 n;e;n;n',
                '长空栈道': 'jh 4;#9 n;e',
                '临渊石台': 'jh 4;#9 n;e;n',
                '沙丘小洞': 'jh 6;event_1_98623439;ne;n;ne;ne;ne;event_1_97428251',
                '悬根松': 'jh 9;n;w',
                '夕阳岭': 'jh 9;n;n;e',
                '青云坪': 'jh 13;e;s;s;w;w',
                '玉壁瀑布': 'jh 16;#4 s;e;n;e',
                '湖边': 'jh 16;#4 s;e;n;e;event_1_5221690;s;w',
                '碧水寒潭': 'jh 18;n;nw;#5 n;ne;#5 n;e;e;se;se;e',
                '寒水潭': 'jh 20;w;w;s;e;#5 s;sw;sw;s;e;se',
                '悬崖': 'jh 20;w;w;s;e;#5 s;sw;sw;s;s;e',
                '戈壁': 'jh 21',
                '山溪畔': 'jh 22;n;n;w;#4 n;look_npc songshan_songshan7;event_1_88705407;s;s',
                '启母石': 'jh 22;n;n;w;w',
                '卢崖瀑布': 'jh 22;#3 n;#5 escape;n;e;n',
                '无极老姆洞': 'jh 22;n;n;w;#4 n',
                '奇槐坡': 'jh 23;#8 n',
                '小洞天': 'jh 24;#4 n;e;e',
                '云步桥': 'jh 24;#9 n',
                '观景台': 'jh 24;#12 n;e;e;n',
                '天梯': 'jh 24;#3 n',
                '危崖前': 'jh 25;w',
                '草原': 'jh 26;w',
                '无名山峡谷': 'jh 29;#4 n',
                '无名峡谷': 'jh 29;#4 n;event_1_60035830;event_1_65661209',

                '饮风客栈': 'jh 1',
                '龙门石窟': 'jh 2',
                '华山村村口': 'jh 3',
                '华山山脚': 'jh 4',
                '安定门': 'jh 5',
                '树洞内部': 'jh 6',
                '乔阴县城北门': 'jh 7',
                '十二盘': 'jh 8',
                '大字岭': 'jh 9',
                '林中小路': 'jh 10',
                '竹林': 'jh 11',
                '青石官道': 'jh 12',
                '丛林山径': 'jh 13',
                '少林寺山门': 'jh 13;n',
                '蜀道': 'jh 14',
                '北郊': 'jh 15',
                '青石大道': 'jh 16',
                '朱雀门': 'jh 17',
                '小村': 'jh 18',
                '终南山路': 'jh 19',
                '山路': 'jh 20'
            },

            OTHER: {
                '长安天策秦王': 'jh 2;#20 n;#4 w;#8 n',
                '天山胡兵到石室': 'sw;n;nw;e;sw;w;s;w;n;w;event_1_69872740;event_1_18663573',
                '星宿射鸟': 'jh 28;n;#6 w;nw;ne;nw;ne;nw;ne;e',
                '杭界山': 'jh 2;n;n;e;s;luoyang317_op1;go_hjs go;se;se;ne;w;n;ne',
                '星宿铁尸': 'jh 28;sw;nw;sw;sw;nw;nw;se;sw',
                '唐门秘道': 'jh 14;w;#3 n;e;e;n;n;#3 ask tangmen_tangmei;e;event_1_8413183;event_1_39383240;e;s;e;n;w;n;n;s;s',
                '洛阳凌中天': 'jh 2;#5 n;e;e;#4 n;e',
                '骆云舟': 'jh 7;#8 s;e;n;e;s;e',

                '冰月谷': 'jh 14;w;#4 n;event_1_32682066',
                '冰湖': 'jh 5;#10 n;ne;chuhaigo;#3 nw;n;ne;nw;w;nw;#5 e;se;e',
                '扬州出发钓鱼加玄铁': 'jh 5;#10 n;ne;chuhaigo;#3 nw;n;ne;nw;w;nw;#5 e;se;n;n;w;n;w;event_1_53278632;sousuo;sousuo;cancel_prompt;s;e;s;e;s;s;e',
                '钓鱼加玄铁': 'jh 35;#3 nw;n;ne;nw;w;nw;#5 e;se;n;n;w;n;w;event_1_53278632;sousuo;sousuo;cancel_prompt;s;e;s;e;s;s;e',
                '云远寺地室': 'jh 2;#16 n;w;#4 s;e;event_1_2215721',
                '蜀山剑派': 'jh 14;sw;s;e;s;s;sw;sw;w;w;s;s;#3 e;n;ne;e;se;s',

                '琅嬛玉洞': 'event_1_61856223;nw;event_1_92817399;w;event_1_91110342;s;event_1_74276536;se;event_1_14726005;sw;event_1_66980486;nw;event_1_39972900;nw;event_1_61689122;w;event_1_19336706;s;event_1_30457951;sw;event_1_96023188;s',
                '无尽深渊': 'event_1_52335885;e;event_1_56082528;e;event_1_96610703;s;event_1_30829528;w;event_1_20919210;w;event_1_45322510;s;event_1_53681413;s;event_1_4732228;e;event_1_24529326;n;event_1_65787232;e;event_1_39859996;s;event_1_22071325;e;event_1_37824403;e;event_1_10669895;n;event_1_87685798;w;event_1_35949241;n;event_1_27708165;e;event_1_9805486;n;event_1_39703232;w',
                '地下迷宫': 'event_1_84441582;e;event_1_2237656;e;s;event_1_6017201;w;event_1_41918724;w;event_1_3312250;s;event_1_89230831;e;event_1_19529478;e;event_1_10694290;s;event_1_43796637;w;event_1_89409875;w;event_1_89738536;w;event_1_96339208;n;event_1_14581238;n;event_1_82876458;n;event_1_91686182;n',
                '山崖': 'event_1_86449371;e;event_1_58530809;s;event_1_53067175;s;event_1_66986009',

                '苗疆密林': 'se;s;s;e;n;n;e',
                '苗疆草地': 's;e;ne;s;sw;e;e;ne',
                '苗疆沼泽': 'ne;nw;ne;ne;n;n;w',
                '山坳年兽': 'jh 1;e;#5 n'
            }
        }
    };

    var AutoFollower = {
        _autoEscape: false,
        _autoFight: false,

        async initialize () {
            if (!System.globalObjectMap.get('msg_team')) {
                await ButtonManager.click('team;prev;golook_room');
            }

            let teamName = System.globalObjectMap.get('msg_team').get('team_name');
            debugging('队伍名字：' + teamName);
            if (!teamName) {
                window.alert('当前没加入任何队伍啊。');
                return false;
            }

            return true;
        },

        check () {
            if (AutoFollower._autoFight) {
                AutoFollower.fight();
            }

            if (AutoFollower._autoEscape) {
                AutoFollower.escape();
            }
        },

        isActive () {
            return AutoFollower._autoEscape || AutoFollower._autoFight;
        },

        enableAutoFight () {
            AutoFollower._autoFight = true;
        },

        disableAutoFight () {
            AutoFollower._autoFight = false;
        },

        enableAutoEscape () {
            AutoFollower._autoEscape = true;
        },

        disableAutoEscape () {
            AutoFollower._autoEscape = false;
        },

        async fight () {
            if (CombatStatus.inProgress()) return;

            action(Panels.Notices.getLatestMessages());

            function action (latestMessages = []) {
                let action = '比试';
                let matches = null;
                for (let i = 0; i < latestMessages.length; i++) {
                    matches = latestMessages[i].match('(.*?)对著(.*?)说道：.*?，领教.*?高招！');
                    if (!matches) {
                        matches = latestMessages[i].match('(.*?)对著(.*?)喝道：.*?今日不是你死就是我活！');
                        if (matches) {
                            action = '杀死';
                        }
                    }

                    if (matches && isTeamMember(matches[1])) {
                        debugging('发现队员 ' + matches[1] + ' 发起战斗：' + matches[0]);
                        break;
                    }
                }

                if (matches) {
                    Objects.Npc.action(new Npc(matches[2]), action);
                }
            }

            function isTeamMember (playerName) {
                return System.globalObjectMap.get('msg_team').elements.filter(v => v['key'].match('member[1-4]')).some(v => v['value'].includes(`,${playerName},`));
            }
        },

        escape () {
            if (!CombatStatus.inProgress()) return;

            if (!ButtonManager.isButtonPressed('id-escape') && Panels.Combat.containsMessage(AutoFollower._teamLead + '一看势头不对，溜了！')) {
                $('#id-escape').click();
            }
        },

        performComboSkill () {
            if (!CombatStatus.inProgress()) return;

            if (rightPeople() && rightTiming()) {
                let skill = chooseBestSkill();
                let bufferRequired = new BufferCalculator(skill).getBufferRequired() + PerformHelper._combatSetting.getBufferReserved();

                if (PerformHelper.readyToPerform(bufferRequired)) {
                    PerformHelper.perform(skill);
                }
            }

            function chooseBestSkill () {

            }

            function rightPeople () {

            }

            function rightTiming () {

            }
        }
    };

    var PuzzleHelper = {
        _targetNpcNames: ['僧人', '侍女', '隐士', '野兔', '护卫', '尹秋水', '家丁', '护卫总管', '耶律楚哥', '易牙传人', '砍柴人', '独孤雄', '王子轩'],
        _workqueue: [],

        reset () {
            PuzzleHelper._workqueue = [];
            ButtonManager.click('auto_tasks cancel');
        },

        async fire () {
            PuzzleHelper.reset();

            await Navigation.travelsalWithEvent('碧海山庄', breakEvent);

            async function breakEvent () {
                let npcs = Objects.Room.getAvailableNpcsV2();
                if (!npcs.length) return false;

                let targets = npcs.filter(v => PuzzleHelper._targetNpcNames.includes(v.getName())).map(v => new Npc(v.getName()));
                for (let i = 0; i < targets.length; i++) {
                    await Objects.Npc.action(targets[i], '对话');
                    let lastMessage = Panels.Notices.getLastMessage();
                    if (isValidTask(lastMessage, targets[i])) PuzzleHelper._workqueue.push(lastMessage);

                    await ExecutionManager.wait(200);
                    if (!hasQuanlifiedTask()) {
                        PuzzleHelper.reset();
                    }
                }

                return PuzzleHelper._workqueue.length === 5;

                function hasQuanlifiedTask () {
                    debugging(`${PuzzleHelper._workqueue.length}/${PuzzleHelper._workqueue}`);
                    return PuzzleHelper._workqueue.length && PuzzleHelper._workqueue.some(t => t.match('天山|苗疆'));
                }

                function isValidTask (message, npc) {
                    return message.includes(npc.getName() + '道：') && !PuzzleHelper._workqueue.includes(message);
                }
            }
        }
    };

    var EscapeToKillHelper = {
        _retry: new Retry(500),
        _actionLink: '',

        async start (actionLink = '') {
            if (!actionLink) {
                let npcId = System.globalObjectMap.get('msg_vs_info').get('vs2_pos1');
                EscapeToKillHelper.actionLink = 'clickButton("kill ' + npcId + '")';
            } else {
                EscapeToKillHelper._actionLink = actionLink;
                ExecutionManager.execute(actionLink);
            }

            EnforceHelper.snapshotEnforce();
            EnforceHelper.maximizeEnforce();

            EscapeToKillHelper._retry.initialize(async function kill () {
                if (CombatStatus.inProgress()) {
                    let skill = Panels.Combat.getAvailableAttackSkills()[0];
                    if (PerformHelper.readyToPerform(new BufferCalculator(skill).getBufferRequired())) {
                        PerformHelper.perform(Panels.Combat.getAvailableAttackSkills()[0]);
                    } else {
                        ButtonManager.click('#3 escape', 0);
                        await ExecutionManager.wait(200);
                    }
                } else {
                    ExecutionManager.execute(EscapeToKillHelper._actionLink);
                }
            });

            await EscapeToKillHelper._retry.fire();

            EnforceHelper.recoverEnforce();
        },

        stop () {
            EscapeToKillHelper._retry.stop();
        }
    };

    var EscapeHelper = {
        _stop: false,

        async escape () {
            if (!CombatStatus.inProgress()) return true;

            debugging('try escaping');
            ButtonManager.click('escape', 0);

            if (CombatStatus.justFinished()) {
                debugging('escaped');
                await ButtonManager.click('prev_combat;golook_room');
                return true;
            }

            return false;
        },

        stop () {
            EscapeHelper._stop = true;
        },

        reset () {
            EscapeHelper._stop = false;
        }
    };

    var KillerHelper = {
        _target: null,

        fire () {
            Objects.Npc.action(new Npc(KillerHelper._target), '杀死');
        },

        setTarget (target) {
            this._target = target;
        }
    };

    var SnakeKiller = {
        _currentEnforce: 0,
        _stop: false,

        async fire () {
            if (SnakeKiller._stop) return;

            await ButtonManager.click('prev;auto_fight 1;enforce 0');
            await ButtonManager.click('golook_room');

            let combat = new Combat();
            combat.initialize(new Npc('青竹蛇'), '杀死', ['茅山道术']);
            await combat.fire();

            let lastMessage = Panels.Notices.filterMessageObjectsByKeyword('获得.*?碎片x.*? \\(.*?/20\\)').last().text();
            if (lastMessage) {
                let matches = lastMessage.match('获得.*?碎片x.*? \\((.*?)/20\\)');
                if (parseInt(matches[1]) < 20) {
                    debugging('获得碎片 ' + matches[1] + '/20');
                    setTimeout(SnakeKiller.fire, 1000);
                } else {
                    ButtonManager.resetButtonById('id-snake-killer');
                    ButtonManager.click('home');
                }
            }

            ButtonManager.click('auto_fight 0;enforce ' + SnakeKiller._currentEnforce);
        },

        async prepare () {
            SnakeKiller._stop = false;
            await ButtonManager.click('score');
            SnakeKiller._currentEnforce = User.attributes.getMaxEnforce();
        },

        stop () {
            SnakeKiller._stop = true;
        }
    };

    var Navigation = {
        async travelsalWithEvent (city, breakEvent) {
            let path = PathManager.getTraversalPathByCity(city);
            if (!path) {
                log('暂时不支持遍历 ' + city + ' 地图。');
                return;
            }

            let steps = path.split(';').extract();
            for (let i = 0; i < steps.length; i++) {
                await Navigation.move(steps[i]);
                if (Panels.Notices.getLastMessage().match('这儿没有这个方向')) {
                    debugging('错误的方向： ' + steps[i] + ', ', Objects.Room.getName);
                    break;
                }

                if (breakEvent && await breakEvent()) break;
            }
        },

        async traversal (city, target) {
            let path = PathManager.getTraversalPathByCity(city);
            if (!path) {
                log('暂时不支持遍历 ' + city + ' 地图。');
                return;
            }

            let steps = path.split(';').extract();
            for (let i = 0; i < steps.length; i++) {
                await Navigation.move(steps[i]);

                if (Panels.Notices.getLastMessage().match('这儿没有这个方向')) {
                    debugging('错误的方向： ' + steps[i] + ', ', Objects.Room.getName);
                    break;
                }

                if (Objects.Room.getName() === target || Objects.Room.hasNpc(target)) break;
            }
        },

        async goto (target) {
            let path = PathManager.getPathByTarget(target);
            if (path) {
                await Navigation.move(path);
            } else if (window.confirm('要不要用引路蜂飞过去？')) {
                await Navigation.move('find_family_quest_road');
                await Navigation.move('find_clan_quest_road');
            } else {
                log('该路径暂时不支持： ' + target);
            }
        },

        async move (path) {
            let steps = path.split(';').extract();

            for (let i = 0; i < steps.length; i++) {
                let command = steps[i][0] !== '~' ? "clickButton('" + steps[i] + "')" : Objects.Room.getEventByName(steps[i].substr(1));

                await ExecutionManager.asyncExecute(command);
            }
        }
    };

    function log (message, object) {
        object ? console.log(message, object) : console.log(message);
    }

    function debugging (message = '', obj, func = null) {
        if (!System.debugMode) return;

        if (func) {
            console.debug('[Debug]', message, func());
        } else if (obj) {
            console.debug(`[Debug]${message}`, obj);
        } else {
            console.debug(`[Debug]`, message);
        }
    }

    Array.prototype.extract = function () {
        let result = [];

        for (let i = 0; i < this.length; i++) {
            if (this[i].charAt(0) === '#') {
                let r = this[i].match('#(.*?) (.*)');
                let repeatTimes = parseInt(r[1]);
                for (let j = 0; j < repeatTimes; j++) {
                    result.push(r[2]);
                }
            } else {
                result.push(this[i]);
            }
        }

        return result;
    };

    JobManager.register('id-combat-helper', 200, CombatHelper.check);

    JobManager.register('id-fishing', 7000, FishingManager.fire);
    JobManager.register('id-killer', 200, KillerHelper.fire);
    JobManager.register('id-credits-tickets', 1000 * 60 * 60 * 2, CreditTicketManager.fire);
    JobManager.register('id-works', 1000 * 60 * 60 * 1, DailyWorksManager.fire);
    JobManager.register('id-idle-checker', 1000 * 60 * 5, IdleChecker.fire);
    JobManager.register('id-leftover-tasks', 1000 * 60, LeftoverChecker.fire);

    JobManager.register('id-escape', 200, EscapeHelper.escape);

    JobManager.register('id-repeater', 200, Repeater.fire);

    JobManager.register('id-auto-follower', 200, AutoFollower.check);
    JobManager.register('id-auto-follower-best-skill', 200, AutoFollower.performComboSkill);

    JobManager.register('id-follow-team-lead', 200, TeamworkHelper.follow);

    var helperConfigurations = [{
        subject: '其他项目',

        buttons: [{
            label: '积分礼券',
            title: '每 ' + JobManager.getJob('id-credits-tickets').getInterval() / (1000 * 60 * 60) + ' 小时检查一次李火狮消费积分，谜题卡，狗年礼券\n\n注意：周一凌晨多领一次礼物功能已经挪到 "自动点完任务" 功能。',
            id: 'id-credits-tickets',

            eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (window.confirm('要不要马上触发一次？')) {
                        CreditTicketManager.fire();
                    }

                    JobManager.getJob(this.id).start();
                } else {
                    JobManager.getJob(this.id).stop();
                }
            }
        }, {
            label: '磕头端茶',
            title: '每 ' + JobManager.getJob('id-works').getInterval() / (1000 * 60 * 60) + ' 小时检查一次端茶倒水擂台等工作。',
            id: 'id-works',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (window.confirm('要不要马上触发一次？')) {
                        await DailyWorksManager.fire();
                    }

                    JobManager.getJob(this.id).start();
                } else {
                    JobManager.getJob(this.id).stop();
                }
            }
        }, {
            label: '打坐练习',
            title: '重新开始练习技能和打坐...\n\n注意：如当前有正在练习的技能，会自动检测重新练习，否则提示确认技能名字。当前版本暂不支持恢复原准备技能。',

            async eventOnClick () {
                await ButtonManager.click('exercise stop;exercise');
                await SkillManager.restartPractice();
            }
        }, {
            label: '挂青蛇',
            title: '自动挂机杀洛阳青蛇获取每天 20 玄武/青龙/朱雀/白虎 碎片...',
            id: 'id-snake-killer',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    await Navigation.move('jh 2;#9 n;e');
                    SnakeKiller.prepare();
                    SnakeKiller.fire();
                } else {
                    SnakeKiller.stop();
                }
            }
        }, {
            label: '发呆检测',
            title: '在同一个地方发呆超过 ' + JobManager.getJob('id-idle-checker').getInterval() / (1000 * 60) + ' 分钟自动回家...',
            id: 'id-idle-checker',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    await IdleChecker.initialize();
                    JobManager.getJob(this.id).start();
                } else {
                    JobManager.getJob(this.id).stop();
                }
            }
        }, {
            label: '自动点完',
            title: '凌晨 5:55 把如下 VIP 点点点完\n\n1. 正邪\n2. 逃犯\n3. 打榜\n4. 师门任务\n5. 帮派任务\n6. 谜题\n7. 闯楼奖励\n8. 李火狮礼券积分谜题卡\n9. 每日一次任务\n10. 排行榜奖励\n\n注意：周日挂着可以在周一凌晨多领一次新礼包。',
            id: 'id-leftover-tasks',

            eventOnClick () {
                ButtonManager.simpleToggleButtonEvent(this) ? JobManager.getJob(this.id).start() : JobManager.getJob(this.id).stop();
            }
        }, {
        }, {
            label: '好',
            title: '实时监控面板，有特定青龙出现抢杀好人...\n\n当前设定监控关键字为：' + DragonMonitor.getRegKeywords(),
            id: 'id-dragon-monitor-kill-good',
            width: '38px',
            marginRight: '1px',

            eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    DragonMonitor.setKillBadPerson(false);
                    ButtonManager.resetButtonById('id-dragon-monitor-kill-bad');

                    DragonMonitor.start();
                } else {
                    DragonMonitor.stop();
                }
            }
        }, {
            label: '坏',
            title: '实时监控面板，有特定青龙出现抢杀坏人...\n\n当前设定监控关键字为：' + DragonMonitor.getRegKeywords(),
            id: 'id-dragon-monitor-kill-bad',
            width: '38px',

            eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    DragonMonitor.setKillBadPerson(true);
                    ButtonManager.resetButtonById('id-dragon-monitor-kill-good');

                    DragonMonitor.start();
                } else {
                    DragonMonitor.stop();
                }
            }
        }, {
            label: '设',
            title: '设置青龙目标...当前设定为：\n\n' + DragonMonitor.getRegKeywords(),
            id: 'id-dragon-monitor-setting',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                let answer = window.prompt('请按格式确认要监控什么青龙装备。\n\n格式说明：\n1. 可用斜线隔开多种不同关键字：轩辕剑碎片/斩龙宝戒\n2. 只需关键字，不需全名：镯/碎片/戒\n3. 每个关键字都支持正则表达式语法', DragonMonitor.getRegKeywords().join('/'));
                if (!answer) return;

                DragonMonitor.setRegKeywords(answer.split('/'));

                $(this).attr('title', '当前设定监控青龙装备关键字为：\n\n' + DragonMonitor.getRegKeywords());
            }
        }, {
            label: '滤',
            title: '设置不打的青龙目标...当前设定为：\n\n' + DragonMonitor.getRegKeywords4ExcludedTargets(),
            width: '38px',

            async eventOnClick () {
                let answer = window.prompt('请按格式 (比如 轩辕剑碎片/镯/斩龙宝戒) 填入不打的青龙关键字。', DragonMonitor.getRegKeywords4ExcludedTargets().join('/'));
                if (!answer) {
                    DragonMonitor.setRegKeywords4ExcludedTargets([]);
                    $(this).attr('title', '当前没有设定不打的青龙');

                    return;
                }

                DragonMonitor.setRegKeywords4ExcludedTargets(answer.split('/'));
                $(this).attr('title', '设置不打的青龙目标...当前设定为：\n\n' + DragonMonitor.getRegKeywords4ExcludedTargets());
            }
        }, {
        }, {
            label: '调试模式',
            title: '当调试模式开启，浏览器控制台会输出更详细的日志，方便追踪问题。',
            id: 'id-debugging',

            eventOnClick () {
                System.debugMode = ButtonManager.simpleToggleButtonEvent(this);
            }
        }, {
        }, {
            label: '飞地图',
            title: '跑地图...',
            hidden: true,

            eventOnClick () {
                let message = '请输入：\n\n地图-目标（少林寺-达摩老祖）或者 地图-房间名（雪亭镇-山坳）';
                let answer = window.prompt(message);

                if (answer) {
                    let info = answer.split('-');
                    let city = info[0];
                    let target = info[1];
                    if (PathManager.getTraversalPathByCity(city)) {
                        Navigation.traversal(city, target);
                    } else {
                        log('没有合适的地图：' + city);
                    }
                }
            }
        }, {
            label: '一直重复',
            title: '点下按钮会一直重复某个动作...\n\n提示：必须在人物或物品的命令界面才能执行。可用于 ab 场景。',
            id: 'id-repeater',
            hidden: true,

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (Repeater.confirmAction()) {
                        JobManager.getJob(this.id).start();
                    } else {
                        ButtonManager.resetButtonById(this.id);
                    }
                } else {
                    JobManager.getJob(this.id).stop();
                }
            }
        }, {
        }, {
            label: '抢杀',
            title: '抢杀某个指定目标...',
            id: 'id-killer',
            hidden: true,

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    let name = window.prompt('请输入要杀的目标名字。');
                    if (name) {
                        KillerHelper.setTarget(name);
                        JobManager.getJob(this.id).start();
                    } else {
                        ButtonManager.resetButtonById(this.id);
                    }
                } else {
                    JobManager.getJob(this.id).stop();
                }
            }
        }, {
            label: '检测状态',
            title: '自动检测状态...',
            id: 'id-auto-status-reset',
            hidden: true,

            eventOnClick () {
                ButtonManager.resetAllButtons();
            }
        }, {
            label: '帮战回位',
            title: '帮战挂了自动一键走回战场...',
            id: 'id-gan-fight-back',
            hidden: true,

            async eventOnClick () {
                await ClanCombatHelper.back();
            }
        }, {
        }, {
            label: '自动跟招',
            title: '此开关打开可以根据队友的出招选择能组成阵法的技能出招...',
            id: 'id-auto-follower-best-skill',
            hidden: true,

            eventOnClick () {
                ButtonManager.simpleToggleButtonEvent(this) ? JobManager.getJob(this.id).start() : JobManager.getJob(this.id).stop();
            }
        }]
    }, {
        subject: '测试中功能',

        buttons: [{
            label: '飞地图',
            title: '跑地图...',

            eventOnClick () {
                let message = '请输入：\n\n地图-目标（少林寺-达摩老祖）或者 地图-房间名（雪亭镇-山坳）';
                let answer = window.prompt(message);

                if (answer) {
                    let info = answer.split('-');
                    let city = info[0];
                    let target = info[1];
                    if (PathManager.getTraversalPathByCity(city)) {
                        Navigation.traversal(city, target);
                    } else {
                        log('没有合适的地图：' + city);
                    }
                }
            }
        }, {
            label: '一直重复',
            title: '点下按钮会一直重复某个动作...\n\n提示：必须在人物或物品的命令界面才能执行。可用于 ab 场景。',
            id: 'id-repeater',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (Repeater.confirmAction()) {
                        JobManager.getJob(this.id).start();
                    } else {
                        ButtonManager.resetButtonById(this.id);
                    }
                } else {
                    JobManager.getJob(this.id).stop();
                }
            }
        }, {
        }, {
            label: '抢杀',
            title: '抢杀某个指定目标...',
            id: 'id-killer',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    let name = window.prompt('请输入要杀的目标名字。');
                    if (name) {
                        KillerHelper.setTarget(name);
                        JobManager.getJob(this.id).start();
                    } else {
                        ButtonManager.resetButtonById(this.id);
                    }
                } else {
                    JobManager.getJob(this.id).stop();
                }
            }
        }, {
            label: '检测状态',
            title: '自动检测状态...',
            id: 'id-auto-status-reset',
            hidden: true,

            eventOnClick () {
                ButtonManager.resetAllButtons();
            }
        }, {
            label: '帮战回位',
            title: '帮战挂了自动一键走回战场...',
            id: 'id-gan-fight-back',
            hidden: true,

            async eventOnClick () {
                await ClanCombatHelper.back();
            }
        }, {
        }, {
            label: '自动跟招',
            title: '此开关打开可以根据队友的出招选择能组成阵法的技能出招...',
            id: 'id-auto-follower-best-skill',
            hidden: true,

            eventOnClick () {
                ButtonManager.simpleToggleButtonEvent(this) ? JobManager.getJob(this.id).start() : JobManager.getJob(this.id).stop();
            }
        }]
    }, {
        subject: '寻路',

        buttons: [{
            label: '一键回家',
            title: '紧急情况下点此按钮可以一键回家，无需任何确认步骤。',
            backgroundColor: 'rgba(150,250,100,0.8)',

            async eventOnClick () {
                ButtonManager.click('home');
            }
        }, {
            label: '一键跨服',
            title: '自动寻路到杜宽处，进入跨服...\n\n注意：进入跨服会自动换成战斗装备。',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (Objects.Room.getName() !== '雪亭驿') await Navigation.move('jh 1;e;#4 n;w');

                    await ButtonManager.click('event_1_36344468');
                    await ExecutionManager.wait(1000);

                    document.title = User.getNickName() + '-跨服';
                    $('#id-equipment-for-combat').click();
                } else {
                    await Navigation.move('home;home;home;home');
                    document.title = User.getNickName();
                }
            }
        }, {
            label: '云远寺',
            title: '一键走到地图碎片所在地室...',

            eventOnClick () {
                if (window.confirm('确定去西安云远寺地室？')) {
                    Navigation.move(PathManager.getPathForSpecificEvent('云远寺地室'));
                }
            }
        }, {
            label: '蜀山剑派',
            title: '一键走到唐门蜀山剑派...',

            eventOnClick () {
                Navigation.move(PathManager.getPathForSpecificEvent('蜀山剑派'));
            }
        }, {
            label: '过澜沧江',
            title: '一键从温青处走到澜沧江南岸...',
            id: 'id-miaojiang-grass',

            async eventOnClick () {
                if (!Objects.Room.hasNpc('温青')) {
                    window.alert('请先走到温青所在地。');
                } else {
                    await Navigation.move('e;s;se;sw;s;sw;e;e;sw;se;sw;se;event_1_8004914');
                }
            }
        }, {
            label: '回城买药',
            title: '点击一次买 50 棵千年灵芝...\n\n注意：不能现场购买，只能回到雪亭镇药铺买，且购买结束无法自动返回当前所在地',

            async eventOnClick () {
                if (Objects.Room.getName() !== '桑邻药铺') {
                    if (window.confirm('确定回雪亭镇买五十棵千年灵芝？')) {
                        await ButtonManager.click('jh 1;e;#3 n;w');
                    }
                }

                await ButtonManager.click('#5 buy /map/snow/obj/qiannianlingzhi_N_10 from snow_herbalist');
            }
        }, {
            label: '山坳年兽',
            title: '一键走到山坳',

            eventOnClick () {
                ButtonManager.click(PathManager.getPathForSpecificEvent('山坳年兽'));
            }
        }, {
            label: '其他寻路',
            title: '按提示走到选项对应的地点...',

            async eventOnClick () {
                let question = '请选择要去的地点？\n\n1. 乔阴骆云舟\n2. 唐门秘道\n3. 星宿铁尸\n4. 天山大漠石室（由胡兵处出发）\n5. 西安天策秦王\n6. 杭界山\n7. 洛阳凌中天';
                let choice = window.prompt(question, 1);
                switch (parseInt(choice)) {
                    case 1:
                        await Navigation.move(PathManager.getPathForSpecificEvent('骆云舟'));
                        break;
                    case 2:
                        await Navigation.move(PathManager.getPathForSpecificEvent('唐门秘道'));
                        break;
                    case 3:
                        await Navigation.move(PathManager.getPathForSpecificEvent('星宿铁尸'));
                        break;
                    case 4:
                        if (!Objects.Room.hasNpc('塞外胡兵')) {
                            window.alert('请先走到天山胡兵所在地。');
                            return;
                        }

                        if (window.confirm('确定带了权杖去大漠石室并点机关？')) {
                            await Navigation.move(PathManager.getPathForSpecificEvent('天山胡兵到石室'));
                        }

                        break;
                    case 5:
                        if (window.confirm('确定走到秦王处？')) {
                            Navigation.move(PathManager.getPathForSpecificEvent('长安天策秦王'));
                        }
                        break;
                    case 6:
                        if (window.confirm('确定花一个金锭到杭界山？')) {
                            Navigation.move(PathManager.getPathForSpecificEvent('杭界山'));
                        }
                        break;
                    case 7:
                        await Navigation.move(PathManager.getPathForSpecificEvent('洛阳凌中天'));
                        break;
                    default:
                }
            }
        }, {
        }, {
            label: '找游侠',
            title: '自动寻找最近出现的游侠...',

            async eventOnClick () {
                let info = await RangerSearchManager.identifyRanger();
                if (!info) {
                    log('目前没有游侠出没。');
                    return;
                }

                let npc = info[1];
                let city = info[2];
                if (window.confirm('确定搜索游侠 ' + npc + ' ，地点 ' + city + '?')) {
                    Navigation.traversal(city, npc);
                }
            }
        }, {
            label: '杀正邪',
            title: '自动寻路正邪...',

            async eventOnClick () {
                let npc = await BanditSearchManager.identifyBandits();
                if (npc !== null) {
                    Navigation.goto(npc);
                }
            }
        }, {
            label: '跨服逃犯',
            title: '自动寻路到跨服逃犯所在地点...\n\n注意：\n1. 请先到跨服\n2. 只抓取段老大和二娘的信息',

            async eventOnClick () {
                await ButtonManager.click('go_chat');
                let place = FugitiveSearchManager.identifyFugitives();
                if (place !== null) {
                    await FugitiveSearchManager.catchTheFugitive(place);
                }
            }
        }, {
        }, {
            label: '苗疆谜题',
            title: '自动对话碧海 npc 看有没有天山苗疆谜题...',

            eventOnClick () {
                if (window.confirm('确定去碧海接谜题？\n\n注意：当前谜题可能会被清空。')) {
                    PuzzleHelper.fire();
                }
            }
        }]
    }, {
        subject: '物品/技能',

        buttons: [{
            label: '装备全脱',
            title: '所有装备全部脱掉...',
            id: 'id-remove-all-equipments',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (window.confirm('确定全部装备脱掉？')) {
                        await ButtonManager.click('auto_equip off');
                    } else {
                        ButtonManager.resetButtonById('id-remove-all-equipments');
                    }
                } else {
                    await ButtonManager.click('auto_equip on');
                }
            }
        }, {
            label: '战',
            title: '切换武器成九天天罡龙鳞，加力且去掉自动战斗...\n\n注意\n1. 在战斗中临时切换也有效。\n2. 如背包里有 11 级武器则装备 11 级武器。',
            id: 'id-equipment-for-combat',
            width: '38px',
            marginRight: '1px',

            eventOnClick () {
                let commands;
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    commands = [
                        'unwield sword of windspring',
                        'unwield weapon_sb_sword10',
                        'unwield weapon_sb_sword11',
                        'unwield weapon_moke_dagger10',
                        'unwield weapon_moke_dagger11',
                        'unwield weapon_sb_unarmed10',
                        'unwield weapon_sb_unarmed11',
                        'wield weapon_sb_sword10',
                        'wield weapon_sb_sword11',
                        'wield weapon_sb_unarmed10',
                        'wield weapon_sb_unarmed11',
                        'wield weapon_moke_dagger10',
                        'wield weapon_moke_dagger11'
                    ].join(';');
                } else {
                    commands = [
                        'unwield sword of windspring',
                        'unwield weapon_sb_sword10',
                        'unwield weapon_sb_sword11',
                        'unwield weapon_moke_dagger10',
                        'unwield weapon_moke_dagger11',
                        'unwield weapon_sb_unarmed10',
                        'unwield weapon_sb_unarmed11',
                        'wield sword of windspring',
                        'wield weapon_sb_unarmed10',
                        'wield weapon_sb_unarmed11',
                        'wield weapon_moke_dagger10',
                        'wield weapon_moke_dagger11'
                    ].join(';');
                }

                ButtonManager.click(commands);
                ButtonManager.click('auto_fight 0;enforce ' + User.attributes.getMaxEnforce());
            }
        }, {
            label: '学',
            title: '切换到悟性最高的装备...\n\n1. 风泉之剑 (+10)\n2. 迷幻经纶 (+3)\n3. 龙渊扳指(+3)',
            width: '38px',

            eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    ButtonManager.click('wield sword of windspring;wear dream hat;wear longyuan banzhi moke');
                } else {
                    ButtonManager.click('wield sword of windspring;wear equip_moke_head10;wear equip_moke_finger10');
                }
            }
        }, {
        }, {
            label: '批',
            title: '需要先开启到操作界面，然后点击此按钮并在输入框里按提示给定操作名字和重复次数，脚本将批量执行该命令...\n\n提示：使用场景可以是批量开箱子，也可以是批量开突破丹礼包',
            id: 'id-batch-execution',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                let texts = ButtonManager.getButtonTexts();
                let options = [];
                for (let i = 0; i < texts.length; i++) {
                    options.push((i + 1) + '. ' + texts[i]);
                }

                let index = window.prompt('要执行当前界面哪个命令（填入数字即可）？\n\n' + options.join('\n'));
                if (index) {
                    let quantityWording = $('span.out3').filter(function () { return $(this).text().match('数量'); }).text().match('数量(.*)');
                    let quantity = quantityWording ? parseInt($('span.out3').filter(function () { return $(this).text().match('数量'); }).text().match('数量(.*)')[1]) : 1;
                    let times = window.prompt('要重复几次？例子：5', quantity);
                    if (times) {
                        if (window.confirm('确认要在当前界面执行 \'' + texts[index - 1] + '\' ' + times + ' 次？')) {
                            let link = ButtonManager.getButtonOnclickLink(texts[index - 1]);
                            if (!Array.isArray(link)) {
                                ButtonManager.click('#' + times + ' ' + link.match('clickButton\\(\'(.*?)\'')[1]);
                            } else {
                                debugging('unexpected multiple options');
                            }
                        }
                    }
                }
            }
        }, {
            label: '卖',
            title: '按此按钮一次卖出指定数量物品...\n\n注意：在物品界面才能操作。',
            width: '38px',

            async eventOnClick () {
                if ($('.cmd_click2').filter(function () { return $(this).text() === '卖掉'; }).length === 1) {
                    let quantity = parseInt($('span.out3').filter(function () { return $(this).text().match('数量'); }).text().match('数量(.*)')[1]);
                    let confirmation = window.prompt('要一次卖出多少件？', quantity);
                    if (confirmation) {
                        ButtonManager.click('#' + quantity + ' ' + ButtonManager.getButtonOnclickLink('卖掉').match('clickButton\\(\'(.*?)\'')[1]);
                    }
                } else {
                    window.alert('必须要在物品界面（有“卖掉”按钮的地方）');
                }
            }
        }, {
            label: '合',
            title: '按提示操作可极大简化合成宝石步骤...\n\n注意：\n1. 只处理背包里的宝石，仓库里的不动\n2. 只合成到完美级别，避免不预期的过度合成',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                let currentView = $('.outtitle').text();

                await GemHelper.countGems();
                let choice = GemHelper.confirmGemName();
                if (choice) {
                    let nameIndex = choice - 1;
                    if (nameIndex !== 'NaN') {
                        let name = GemHelper._gemNames[nameIndex];
                        if (GemHelper.confirmMerge(name)) {
                            GemHelper.mergeGems(name);
                        }
                    }
                } else if (currentView !== '状 态') {
                    ButtonManager.click('prev');
                }
            }
        }, {
            label: '整',
            title: '一键卖掉分解背包里不需要的垃圾...',
            width: '38px',

            async eventOnClick () {
                let currentView = $('.outtitle').text();
                await ButtonManager.click('items');

                let itemsToSell = BackpackCleaner.getItemsToSell();
                let itemsToSplit = BackpackCleaner.getItemsToSplit();
                if (!itemsToSell.length && !itemsToSplit.length) {
                    window.alert('背包里能处理的都已经处理了。');
                } else {
                    let confirmationMessage = '确定处理掉身上的这些物品？';
                    if (itemsToSell.length) confirmationMessage += '\n\n卖：\n' + BackpackCleaner.getItemListWithQuantities(itemsToSell);
                    if (itemsToSplit.length) confirmationMessage += '\n\n分解：\n' + BackpackCleaner.getItemListWithQuantities(itemsToSplit);

                    if (window.confirm(confirmationMessage)) {
                        await BackpackCleaner.sell(itemsToSell);
                        await BackpackCleaner.split(itemsToSplit);
                    }
                }

                if (currentView !== '状 态') {
                    ButtonManager.click('prev');
                }
            }
        }, {
        }, {
            label: '1',
            title: '重置准备技能回技能方案 1...',
            width: '24px',
            marginRight: '1px',

            async eventOnClick () {
                await SkillManager.reEnableSkills(1);
                await ButtonManager.click('prev');
            }
        }, {
            label: '2',
            title: '重置准备技能回技能方案 2...',
            width: '24px',
            marginRight: '1px',

            async eventOnClick () {
                await SkillManager.reEnableSkills(2);
                await ButtonManager.click('prev');
            }
        }, {
            label: '3',
            title: '重置准备技能回技能方案 3...',
            width: '24px',

            async eventOnClick () {
                await SkillManager.reEnableSkills(3);
                await ButtonManager.click('prev');
            }
        }, {
            label: '设置必刷',
            title: '设置必刷技能...',

            eventOnClick () {
                let message = ['要选择哪种操作？\n',
                    '1. 必刷天师灭神剑',
                    '2. 取消天师灭神剑必刷',
                    '3. 必刷茅山道术',
                    '4. 取消茅山道术必刷',
                    '5. 必刷乾坤大挪移',
                    '6. 取消乾坤大挪移必刷'
                ].join('\n');

                let choice = window.prompt(message);
                if (choice && parseInt(choice)) {
                    SkillManager.prepareAttackSkills(choice);
                }
            }
        }
        ]
    }, {
        subject: '日常任务',
        offset: 2,

        buttons: [{
            label: '基本',
            title: '当前设定为：\n\n' + DailyOneOffTaskHelper.getTaskListString(true),
            width: '60px',
            marginRight: '1px',
            id: 'id-oneoff-tasks',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (window.confirm('确定开始以下项目？\n\n' + DailyOneOffTaskHelper.getTaskListString(true))) {
                        await DailyOneOffTaskHelper.fire();
                    }
                }

                DailyOneOffTaskHelper.stop();
                ButtonManager.resetButtonById('id-oneoff-tasks');
            }
        }, {
            label: '.',
            title: '设置本次要执行的任务。例如 1-4 表示从第一到第四项。默认为全部。',
            width: '10px',
            id: 'id-oneoff-tasks-setting',

            async eventOnClick () {
                let todoTasks = DailyOneOffTaskHelper.getTaskDefined().filter(v => !v['completed']);
                let defaultChoice = !todoTasks.length ? '1-9' : ((todoTasks.length === 1) ? '1' : todoTasks[0]['index'] + '-' + todoTasks[todoTasks.length - 1]['index']);
                let choice = window.prompt('请指定要执行任务的序号（1-4 可表示一至四项）。\n\n' + DailyOneOffTaskHelper.getTaskListString(false, true), defaultChoice);
                if (!choice) return;

                if (!DailyOneOffTaskHelper.initialize(choice)) {
                    window.alert('请按格式输入任务序号或序号范围。');
                } else {
                    $('#id-oneoff-tasks').attr('title', '当前设定为：\n\n' + DailyOneOffTaskHelper.getTaskListString(true));
                }
            }
        }, {
            label: '侠',
            title: '一键从任意处到侠客岛大厅观阅，然后自动跳瀑布到成功为止（跳瀑布途中可手动放弃）...\n\n',
            id: 'id-warrior-island-daily',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (window.confirm('侠客岛日常耗时看脸，确定开始？')) {
                        await WarriorIslandDailyHelper.start();
                    } else {
                        ButtonManager.resetButtonById(this.id);
                    }
                } else {
                    WarriorIslandDailyHelper.stop();
                }
            }
        }, {
            label: '钓',
            title: '自动钓鱼顺便摸两次玄铁，钓鱼完毕自动回家开消息窗口。',
            id: 'id-fishing',
            width: '38px',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    let decision = true;
                    if (Objects.Room.getName() !== '冰湖') {
                        if (window.confirm('确定去钓鱼? ')) {
                            await FishingManager.gotoTarget();
                        } else {
                            decision = false;
                            ButtonManager.resetButtonById(this.id);
                        }
                    }

                    if (decision) JobManager.getJob(this.id).start();
                } else {
                    JobManager.getJob(this.id).stop();
                    ButtonManager.resetButtonById(this.id);
                }
            }
        }, {
            label: '天',
            title: '一键到天山千年寒冰...\n\n注意：\n1. 出发点从天山山脚开始。\n2. 请预先自备掌门手喻在背包。',
            id: 'id-tianshan-daily',
            width: '38px',
            marginRight: '1px',

            eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (Objects.Room.getName() !== '天山山脚') {
                        window.alert('请先自行走到天山山脚。');
                        ButtonManager.resetButtonById(this.id);
                        return;
                    }

                    if (window.confirm('此项目耗时看脸，确定开始？')) TianshanDailyHelper.start();
                } else {
                    TianshanDailyHelper.stop();
                }
            }
        }, {
            label: '苗',
            title: '在苗疆炼毒室开始炼药。\n\n注意：\n1. 如果当前在澜沧江南岸，会自行先寻路到苗疆炼毒室。\n2. 如果已经在炼毒室，会自动开始炼药\n3. 炼药结束自动行走到山门往下的安全区域\n4. 炼药材料不足会自动补充',
            id: 'id-miaojiang-distill-drugs',
            width: '38px',

            async eventOnClick () {
                let roomName = Objects.Room.getName();
                if (roomName === '澜沧江南岸') {
                    await MiaojiangHelper.goOutMaze('苗疆密林');
                    await MiaojiangHelper.goOutMaze('苗疆草地');
                    await MiaojiangHelper.goOutMaze('苗疆沼泽');
                }

                if (Objects.Room.getName() === '炼毒室') {
                    await MiaojiangHelper.produceDrugs();
                } else {
                    window.alert('请先走到澜沧江南岸或者炼毒室。');
                }
            }
        }, {
            label: '题',
            title: '高亮答案且自动答题，题库中如果找不到答案将停止...',
            id: 'btnQuizzesHelper',
            width: '38px',
            marginRight: '1px',

            eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this) && window.confirm('确定开始自动答题？')) {
                    QuizzesHelper.reset();
                    QuizzesHelper.answer();
                } else {
                    QuizzesHelper.stop();
                }
            }
        }, {
            label: '剑',
            title: '自动完成论剑\n\n记录当前加力 -> 选择三个帮手 -> 开启自动出招 -> 完成 5 次论剑 -> 恢复加力\n\n注意：目前不支持中途暂停',
            width: '38px',

            async eventOnClick () {
                let debate = new Debate();
                await debate.prepare();
                await debate.start();
            }
        }, {
            label: '谷',
            title: '进入冰月谷...',
            id: 'id-icemoon-valley',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                if (window.confirm('一天只有一次机会，确定进入冰月谷？')) {
                    await Navigation.move(PathManager.getPathForSpecificEvent('冰月谷'));
                }
            }
        }, {
            label: '壁',
            title: '一键从任意处到大昭壁画所在地面壁...',
            width: '38px',

            eventOnClick () {
                Navigation.move('jh 26;w;w;n;w;w;w;n;n;e;event_1_12853448');
            }
        }, {
        }, {
            label: '青',
            width: '38px',
            marginRight: '1px',
            title: '一键从任意处到青城孽龙所在地...',

            eventOnClick () {
                Navigation.move('jh 15;n;nw;w;nw;n;event_1_14401179');
            }
        }, {
            label: '恒',
            width: '38px',
            title: '一键从任意处到恒山武安君庙...',

            eventOnClick () {
                Navigation.move('jh 9;event_1_20960851');
            }
        }, {
            label: '峨',
            width: '38px',
            marginRight: '1px',
            title: '一键从任意处到峨嵋军阵钓鱼山脚...',

            eventOnClick () {
                Navigation.move('jh 8;ne;#3 e;n');
            }
        }, {
            label: '劳',
            width: '38px',
            title: '一键从峨嵋军阵金狼处到军械官所在地并捐赠一金锭劳军...',

            eventOnClick () {
                if (Objects.Room.getName() !== '护国门') {
                    window.alert('请先走到护国门金狼死士所在地。');
                    return;
                }

                Navigation.move('e;e;n;event_1_19360932 go');
            }
        }, {
            label: '驼',
            title: '一键从任意处走到白驼闯阵入口青铜盾阵...',
            width: '38px',
            marginRight: '1px',

            eventOnClick () {
                Navigation.move('jh 21;#4 n;w');
            }
        }, {
            label: '鸟',
            title: '一键从任意处走到星宿凤凰林...',
            width: '38px',

            eventOnClick () {
                Navigation.move(PathManager.getPathForSpecificEvent('星宿射鸟'));
            }
        }, {
        }, {
            label: KnightManager.getKeyKnight() ? `撩${KnightManager.getKeyKnight().substr(0, 2)}` : '撩奇侠',
            title: '平民版撩奇侠（当前奇侠目标未设定）增加好感度\n\n免小号：放茅山道术招小弟->逃跑->和奇侠群殴小弟',
            id: 'id-please-knight',
            width: '60px',
            marginRight: '1px',

            async eventOnClick () {
                if (!KnightManager.getKeyKnight()) {
                    $('#id-please-knight-setting').click();
                    return;
                }

                await KnightManager.please(KnightManager._keyKnightName);
            }
        }, {
            label: '.',
            title: '设置要撩的奇侠名字。\n\n注意：\n1. 只要茅山道术或者天师灭神剑任意一个设置了必刷，脚本会在战斗中自动选择可用的那个。\n2. 脚本会自选攻击技能 k 小弟。\n3. 脚本会根据当前奇侠好感度推测一个最有可能的（好感度未达到但最接近 25000）作为默认值。',
            width: '10px',
            id: 'id-please-knight-setting',

            async eventOnClick () {
                if (!KnightManager.getKeyKnight()) {
                    await KnightManager.detectUserSettings();
                }

                let target = window.prompt('请确认要撩的奇侠名字', KnightManager.getKeyKnight());
                if (!target) return;
                KnightManager.setKeyKnight(target);

                $('#id-please-knight').text(KnightManager.getKeyKnight());
            }
        }, {
            label: '秘',
            title: '根据最新出现的秘境提示行走至目的地...\n\n注意：暂不支持自动判断最大化搜索收益。',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                await ButtonManager.click('golook_room');

                if (Objects.Room.isSecurePlace() && !window.confirm('当前还在秘境里，确定离开？')) {
                    return;
                }

                KnightManager.findSecretTreasure();
            }
        }, {
            label: '翻',
            title: '秘境翻查升级版，脚本会自动识别需要翻查的秘境，并开始寻路翻查...\n\n目前支持如下秘境：\n1. 琅嬛玉洞\n2. 地下迷宫\n3. 无尽深渊',
            width: '38px',

            async eventOnClick () {
                await Navigation.move('golook_room');
                let roomName = Objects.Room.getName();
                switch (roomName) {
                    case '通道':
                        await Navigation.move(PathManager.getPathForSpecificEvent('琅嬛玉洞'));
                        break;
                    case '地下迷宫':
                        await Navigation.move(PathManager.getPathForSpecificEvent('地下迷宫'));
                        break;
                    case '无尽深渊':
                        if (window.confirm('确定继续？\n\n注意：黯然开脉开一半者慎用，因为第二次翻查真的龙骨草必须先对话秘境最深处的老者。')) {
                            await Navigation.move(PathManager.getPathForSpecificEvent('无尽深渊'));
                        }
                        break;
                    case '密道':
                        await Navigation.move(PathManager.getPathForSpecificEvent('山崖'));
                        break;
                    default:
                        window.alert('本功能暂不支持此秘境。');
                }
            }
        }, {
            label: '扫荡',
            title: '根据最新出现的秘境提示自动扫荡取最大收益...',
            id: 'id-auto-sweep',
            width: '60px',
            marginRight: '1px',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    await ButtonManager.click('golook_room');
                    if (!Objects.Room.isSecurePlace()) {
                        window.alert('当前不在秘境里');
                        ButtonManager.resetButtonById(this.id);
                        return;
                    }

                    await ExecutionManager.asyncExecute(Objects.Room.filterTargetObjectsByKeyword('仔细搜索').attr('onclick'));
                    let placeCode = Objects.Room.filterTargetObjectsByKeyword('扫荡').attr('onclick').match('clickButton\\(\\\'(.*?)_saodang\\\', 0\\)')[1];
                    let finalGoal = SecretPlaceSearchManager.getCustomizedGoal() ? SecretPlaceSearchManager.getCustomizedGoal() : SecretPlaceHelper.getDefaultGoal(placeCode);
                    if (!finalGoal) {
                        finalGoal = window.prompt('当前秘境暂时不支持自动扫荡，请输入目标果子数？');
                        if (!finalGoal) {
                            ButtonManager.resetButtonById(this.id);
                            return;
                        }
                    }

                    SecretPlaceSearchManager.getSecretPlaceSearch().prepare(placeCode, finalGoal);
                    await SecretPlaceSearchManager.getSecretPlaceSearch().start();
                    ButtonManager.resetButtonById(this.id);
                    SecretPlaceSearchManager.setCustomizedGoal(0);
                } else {
                    SecretPlaceSearchManager.getSecretPlaceSearch().stop();
                }
            }
        }, {
            label: '.',
            title: '设置当前秘境要扫荡达到的目标值，避免脸黑一直扫荡都没法完成。',
            width: '10px',
            id: 'id-auto-sweep-setting',

            async eventOnClick () {
                await ButtonManager.click('golook_room');
                if (!Objects.Room.isSecurePlace()) {
                    window.alert('当前不在秘境里。');
                    return;
                }

                let placeCode = Objects.Room.filterTargetObjectsByKeyword('扫荡').attr('onclick').match('clickButton\\(\\\'(.*?)_saodang\\\', 0\\)')[1];
                let goal = window.prompt('请输入要达到的数值？', SecretPlaceHelper.getDefaultGoal(placeCode));
                if (goal) {
                    SecretPlaceSearchManager.setCustomizedGoal(goal);
                }
            }
        }, {
            label: '$1',
            title: '给指定奇侠 1 金锭',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                if (!KnightManager.getKeyKnight()) {
                    $('#id-please-knight-setting').click();
                    return;
                }

                await KnightManager.giveGold(KnightManager._keyKnightName, '赠送金锭');
            }
        }, {
            label: '$15',
            title: '给指定奇侠 15 金锭',
            width: '38px',

            async eventOnClick () {
                if (!KnightManager.getKeyKnight()) {
                    $('#id-please-knight-setting').click();
                    return;
                }

                await KnightManager.giveGold(KnightManager._keyKnightName, '赠送15金锭');
            }
        }, {
            label: '随机走杀',
            title: '叫杀当前地图的所有 npc，随机寻找路径，战斗结束后自动搜身...',
            id: 'id-map-killer',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (window.confirm('确定开始随机走图且叫杀所有 npc?')) {
                        MapCleaner.reset();
                        await MapCleaner.start();
                    } else {
                        ButtonManager.resetButtonById(this.id);
                    }
                } else {
                    MapCleaner.stop();
                }
            }
        }, {
            label: '一键果子',
            title: '自动按最优策略依次对话奇侠拿果子\n\n注意：\n1. 每天20次的撩奇侠请自行先解决，否则相当于浪费20次机会。\n2. 本版本针对未出师的奇侠会跳出提示跳过或取消当前轮。\n3. 当前策略：先筛选好感度达到 25000 的游侠，按好感度从低到高对话，剩余奇侠按好感度从高到低依次对话。',
            id: 'id-fruits',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    await KnightManager.prepareAskingForFruits();
                    await KnightManager.askForFruits();
                } else {
                    KnightManager.stopAskingForFruits();
                }
            }
        }, {
        }, {
            label: '师',
            title: '每点一次自动申领并完成一个师门任务（战斗、购买、拾物及搜身类均已支持）。\n\n注意：\n1. 考虑到地图路径还不完全，当前版本暂不支持一键全自动所有任务。\n2. 少量任务会自动消耗引路蜂\n3. 脚本自动判断第 25 个时 vip 点掉并继续第 26 个\n\n如有发现某个任务无法完成，请告知任务信息比如 \'给我在19分20秒内杀乞丐。任务所在地方好像是：大昭寺-八角街\'',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                await ButtonManager.click('go_family');
                await ButtonManager.click('family_quest');
                if (Panels.Notices.containsMessage('今天做的师门任务已过量，明天再来。')) return;

                if (await GenericTaskManager.handleTask()) {
                    ButtonManager.click('prev_combat;go_family');
                    await ExecutionManager.wait(500);
                    let link = await Panels.Family.getActionLink('交任务');
                    await ExecutionManager.asyncExecute(link);
                }
            }
        }, {
            label: '帮',
            title: '和师门任务类似，所有功能通用',
            width: '38px',

            async eventOnClick () {
                await ButtonManager.click('clan scene;clan task', 800);
                if (Panels.Notices.containsMessage('今天做的帮派任务已过量，明天再来。')) return;

                if (await GenericTaskManager.handleTask()) {
                    ButtonManager.click('prev_combat;clan scene');
                    await ExecutionManager.wait(800);
                    let link = await Panels.Family.getActionLink('交任务');
                    await ExecutionManager.asyncExecute(link);
                }
            }
        }, {
            label: '碎',
            width: '38px',
            marginRight: '1px',
            title: '无须回帮派，现场提交帮派碎片...',

            eventOnClick () {
                ButtonManager.click('clan bzmt puzz');
            }
        }, {
            label: '谜',
            width: '38px',
            title: '无须回师门，现场清谜题...',

            eventOnClick () {
                if (window.confirm('确定清除已接谜题？')) {
                    PuzzleHelper.reset();
                }
            }
        }, {
        }, {
            label: '一键森林',
            title: '一键按既定路径（4层->3层->2层->1层自动寻找路径并叫杀 npc...\n\n注意：\n未经测试版',
            id: 'id-forest-killer',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (Objects.Room.getName() !== '幽荧殿') {
                        window.alert('目前本功能只支持从森林起点幽荧殿开始。');
                        ButtonManager.resetButtonById(this.id);
                        return;
                    }

                    if (window.confirm('确定开始按既定路径（4层->3层->2层->1层 自动寻找路径并叫杀 npc?')) {
                        await MapCleanerV2.gotoStartPoint('#4 s;#3 w');

                        let travelsalPath = '#6 e;#3 w;n;#3 w;#6 e;#3 w;n;#3 w;#6 e;#3 w;n;#3 w;#6 e;#3 w;#4 n'.split(';').extract();
                        MapCleanerV2.initialize(travelsalPath, 5000);
                        await MapCleanerV2.start();
                    } else {
                        ButtonManager.resetButtonById(this.id);
                    }
                } else {
                    MapCleanerV2.stop();
                }
            }
        }]
    }, {
        subject: '战斗/补给',
        offset: 3,

        buttons: [{
            label: PerformHelper.getCombatSetting().getSkillsAbbr(),
            id: 'id-auto-perform',
            width: '64px',
            marginRight: '1px',
            title: '自动攒气出招, 预留 2 气\n\n注意：\n1. 必刷技能设置多于四个时可能连招失败\n2. 只匹配到一个招数名字时，按单招触发\n3. 暂时不支持设置预留气的数目',

            async eventOnClick () {
                let defaultText = PerformHelper.getCombatSetting().getSkillsAbbr();
                let defaultLabel = new ButtonLabel(defaultText);
                let toggleLabel = new ButtonLabel('x ' + defaultText, '', 'red');

                if (ButtonManager.toggleButtonEvent(this, defaultLabel, toggleLabel)) {
                    if (!CombatHelper.isInUsed()) JobManager.getJob('id-combat-helper').start();

                    CombatHelper.enableAutoPerforming();
                } else {
                    CombatHelper.disableAutoPerforming();

                    if (!CombatHelper.isInUsed()) JobManager.getJob('id-combat-helper').stop();
                }
            }
        }, {
            label: '.',
            title: '设置战斗中出的招数，用半角+可以设置连招...',
            width: '10px',
            id: 'id-auto-perform-setting',

            async eventOnClick () {
                let answer = window.prompt('请按格式确认绝学阵所需技能名字，例如：九天龙吟剑法+排云掌法', PerformHelper.getCombatSetting().getSkills().join('+'));
                if (!answer) return;
                PerformHelper.getCombatSetting().setSkills(answer.split('+'));

                let text = PerformHelper.getCombatSetting().getSkillsAbbr();
                if ($('#id-auto-perform').text().includes('x')) text = 'x ' + text;

                $('#id-auto-perform').text(text);
            }
        }, {
            label: RecoveryHelper.getSkill().substr(0, 2) + ' ' + RecoveryHelper.getThreshold(),
            id: 'id-auto-recovery',
            title: '血量低于 ' + (RecoveryHelper.getThreshold() * 100) + '%' + ' 时自动内功回血，当前内功设定为 ' + RecoveryHelper.getSkill(),
            width: '64px',
            marginRight: '1px',

            async eventOnClick () {
                let defaultText = RecoveryHelper.getSkill().substr(0, 2) + ' ' + RecoveryHelper.getThreshold();
                let defaultLabel = new ButtonLabel(defaultText);
                let toggleLabel = new ButtonLabel('x ' + RecoveryHelper.getSkill().substr(0, 2), '', 'red');

                if (ButtonManager.toggleButtonEvent(this, defaultLabel, toggleLabel)) {
                    if (!CombatHelper.isInUsed()) JobManager.getJob('id-combat-helper').start();

                    CombatHelper.enableAutoRecovery();
                } else {
                    CombatHelper.disableAutoRecovery();

                    if (!CombatHelper.isInUsed()) JobManager.getJob('id-combat-helper').stop();
                }
            }
        }, {
            label: '.',
            title: '设置战斗中用于回血的内功，以及多少百分比的血量触发回血',
            width: '10px',
            id: 'id-auto-recovery-setting',

            async eventOnClick () {
                if (!RecoveryHelper.getSkill()) {
                    await RecoveryHelper.prepare();
                }

                let answer = window.prompt('请按格式确认用于回血的内功名字以及触发回血动作的血量百分比：\n\n例子（道心，一半血量回血）：道心种魔心经/0.5', RecoveryHelper.getSkill() + '/' + RecoveryHelper.getThreshold());
                if (!answer) return;
                RecoveryHelper.setSkill(answer.split('/')[0]);
                RecoveryHelper.setThreshold(answer.split('/')[1]);

                let percentage = parseInt(RecoveryHelper.getThreshold() * 100) + '%';
                $('#id-auto-recovery').text(RecoveryHelper.getSkill().substr(0, 2) + ' ' + RecoveryHelper.getThreshold());
                $('#id-auto-recovery').attr('title', '血量低于 ' + percentage + ' 时自动内功回血，当前内功设定为 ' + RecoveryHelper.getSkill());
            }
        }, {
            label: '不攻击',
            id: 'id-stop-attacking',
            title: '此按钮按下后，脚本会持续选取当前必刷里的非攻击技能出招消耗气。\n\n注意：如有轻功优先轻功，否则内功（不包括茅山道术）。',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (!CombatHelper.isInUsed()) JobManager.getJob('id-combat-helper').start();

                    CombatHelper.enableDefenceMode();
                } else {
                    CombatHelper.disableDefenceMode();

                    if (!CombatHelper.isInUsed()) JobManager.getJob('id-combat-helper').stop();
                }
            }
        }, {
            label: '搜',
            id: 'id-body-search',
            title: '自动搜身。\n\n规则：\n1. 检索在场所有可搜目标直到全部搜完为止\n2. 对已经提示搜完的目标自动过滤\n3. 对提示了搜出物品的目标自动确认是否还有物品，没有物品才过滤\n4. 战斗过程中可以提前点此按钮，战斗结束后自动开始抢搜当前地点所有目标\n5. 可手工停止',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    await BodySearchHelper.identifyCandidates();
                    await BodySearchHelper.check();
                } else {
                    BodySearchHelper.stop();
                }
            }
        }, {
            label: '逃',
            title: '点击此按钮可以连续自动发出逃跑命令，直到逃跑成功...\n\n注意：此按钮平时如果按下，也可以防止杀气过高误叫杀。',
            id: 'id-escape',
            width: '38px',

            eventOnClick () {
                ButtonManager.simpleToggleButtonEvent(this) ? JobManager.getJob(this.id).start() : JobManager.getJob(this.id).stop();
            }
        }, {
            label: '取消加力',
            id: 'id-enforce',
            title: '脚本加载时会自动测试当前最大加力，此按钮可以切换最大加力和 0 加力。',

            async eventOnClick () {
                if (this.innerText === '取消加力') {
                    await ButtonManager.click('enforce 0');
                    this.innerText = '恢复加力';
                    this.style.color = 'red';
                    this.title = '点击可开启当前最大加力' + User.attributes.getMaxEnforce();
                } else {
                    await ButtonManager.click('enforce ' + User.attributes.getMaxEnforce());
                    this.innerText = '取消加力';
                    this.style.color = 'black';
                    this.title = '点击可设置加力为 0';
                }
            }
        }, {
        }, {
            label: '切磋回内',
            title: '点开任意 npc 到有比试选项的界面，即可自动持续切磋至内力补满 90%。\n\n注意：\n1. 必刷道心（需链接不动）\n2. 为避免 npc 血太少无法持续切磋，脚本会持续自动逃跑再进入战斗放道心\n3. 中途可手工停止',
            id: 'id-force-recovery-by-fight',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (ForceRecoveryHelper.goodEnough()) {
                        window.alert('当前内力已经没有必要继续恢复了吧。');
                    } else {
                        let actionLink = Objects.Npc.getActionLink('比试');
                        if (actionLink) {
                            ForceRecoveryHelper.reset();
                            await ForceRecoveryHelper.start(actionLink);
                        } else {
                            window.alert('未指定切磋对象，请点击在场 npc 的名字到比试选项界面。');
                        }
                    }
                }

                ButtonManager.resetButtonById(this.id);
                ForceRecoveryHelper.stop();
                await ButtonManager.click('prev_combat;golook_room', 0);
            }
        }, {
            label: 'mp',
            title: '点击一次自动服用适当棵数千年灵芝补满内力...\n\n注意：\n1. 自动计算需要多少棵千年灵芝。\n2. 自动检测是否内力已满。在内力离最大值只差不到 2000 的情况下不会服用灵芝，避免浪费。',
            id: 'id-recover-force-manually',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                await RecoveryHelper.recoverForce();
            }
        }, {
            label: 'hp',
            title: '点击一下吸气 3 次...',
            width: '38px',

            eventOnClick () {
                ButtonManager.click('#3 recovery');
            }
        }, {
            label: 'hp & mp',
            title: '战斗完毕自动吸气疗伤，且千年灵芝补蓝...\n\n注意：\n1. 自动吸气到满血停止\n2. 自动使用适量千年灵芝补充内力到离内力最大值不到 2000\n3. 按下即可保持自动补血补内状态',
            id: 'id-recover-hp-mp',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    await RecoveryHelper.initializeContinualRecover();
                    await RecoveryHelper.startContinualRecovery();
                } else {
                    RecoveryHelper.stopContinualRecovery();
                }
            }
        }, {
        }, {
            label: TeamworkHelper.getTeamLeadName() ? `加${TeamworkHelper.getTeamLeadName().substr(0, 1)}队` : '加队伍',
            title: '一键向设定好的队长发起组队请求\n\n注意：\n队长必须在“将”模式开启情况下才能自动批准入队',
            id: 'id-join-team',
            width: '60px',
            marginRight: '1px',

            eventOnClick () {
                if (TeamworkHelper.getTeamLeadId()) {
                    TeamworkHelper.requestToJoin();
                } else {
                    $('#id-join-team-setting').click();
                }
            }
        }, {
            label: '.',
            title: '设置常用队长名字...\n\n注意：\n1. 必须是好友\n2. 暂不支持跨服组队\n3. 暂不支持浏览器刷新后读旧值',
            id: 'id-join-team-setting',
            width: '10px',

            async eventOnClick () {
                let answer = window.prompt('请输入常用队长名字：\n\n注意：\n1. 必须是好友\n2. 目前尚不支持浏览器刷新后读旧值', TeamworkHelper.getTeamLeadName());
                if (!answer) return;

                if (!await TeamworkHelper.identifyTeamLeadName(answer)) {
                    window.alert(`当前好友列表里找不到名字为 ${answer} 的好友，请检查拼写。`);
                    return;
                }

                let teamLeadNameAbbr = answer.substr(0, 1);
                $('#id-join-team').text(`加${teamLeadNameAbbr}队`);
            }
        }, {
            label: '将',
            title: '队长模式\n\n注意：\n1. 开启本模式会自动激活群殴相关功能\n2. 开启本模式会监听组队请求并自动批准',
            id: 'id-team-lead',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    await TeamworkHelper.createTeamIfNeeded();

                    TeamworkHelper.setLeadMode(true);

                    ButtonManager.resetButtonById('id-team-member');
                    ButtonManager.pressDown('id-recover-hp-mp');
                    ButtonManager.pressDown('id-auto-follower-fight');
                } else {
                    TeamworkHelper.setLeadMode(false);

                    ButtonManager.resetButtonById('id-recover-hp-mp');
                    ButtonManager.resetButtonById('id-auto-follower-fight');
                }
            }
        }, {
            label: '兵',
            title: '队员模式',
            id: 'id-team-member',
            width: '38px',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    ButtonManager.resetButtonById('id-team-lead');

                    ButtonManager.pressDown('id-recover-hp-mp');
                    ButtonManager.pressDown('id-auto-follower-fight');
                    ButtonManager.pressDown('id-follow-team-lead');
                } else {
                    ButtonManager.resetButtonById('id-recover-hp-mp');
                    ButtonManager.resetButtonById('id-auto-follower-fight');
                    ButtonManager.resetButtonById('id-follow-team-lead');
                }
            }
        }, {
            label: '群',
            title: '同组队员比试跟着比试，同组队员叫杀跟着叫杀...\n\n注意：\n1. 必须组队，脚本自动判断同组队员和战斗对象\n2. 只能跟随同一场景的其他队员叫杀或者比试',
            id: 'id-auto-follower-fight',
            width: '38px',
            marginRight: '1px',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (!await AutoFollower.initialize()) {
                        ButtonManager.resetButtonById(this.id);
                        return;
                    }

                    if (!AutoFollower.isActive()) JobManager.getJob('id-auto-follower').start();

                    AutoFollower.enableAutoFight();
                } else {
                    AutoFollower.disableAutoFight();

                    if (!AutoFollower.isActive()) JobManager.getJob('id-auto-follower').stop();
                }
            }
        }, {
            label: '逃',
            title: '同伙撤退跟着撤退...\n\n注意：\n1. 必须组队\n2. 脚本自动判断其他队员名字和逃跑动作\n3. 其他任意一个队员成功逃跑时跟着逃',
            id: 'id-auto-follower-escape',
            width: '38px',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (!await AutoFollower.initialize()) {
                        ButtonManager.resetButtonById(this.id);
                        return;
                    }

                    if (!AutoFollower.isActive()) JobManager.getJob('id-auto-follower').start();

                    AutoFollower.enableAutoEscape();
                } else {
                    AutoFollower.disableAutoEscape();
                    ButtonManager.resetButtonById('id-escape');

                    if (!AutoFollower.isActive()) JobManager.getJob('id-auto-follower').stop();
                }
            }
        }, {
            label: '跟队长走',
            title: '按钮保持按下状态时，会自动跟随队长移动...\n\n注意：\n1. 队长不需要按下此按钮\n2. 队长需要通过操作本按钮下方的方向按钮才能发出指令让本功能发挥作用',
            id: 'id-follow-team-lead',

            async eventOnClick () {
                ButtonManager.simpleToggleButtonEvent(this) ? JobManager.getJob(this.id).start() : JobManager.getJob(this.id).stop();
            }
        }, {
            label: '↖',
            title: '队长功能：往左上走一步...\n\n注意：只有通过本按钮操作，队员才能监听到移动号令并同步移动',
            width: '24px',
            marginRight: '1px',

            eventOnClick () {
                TeamworkHelper.move('nw');
            }
        }, {
            label: '上',
            title: '队长功能：往上走一步...\n\n注意：只有通过本按钮操作，队员才能监听到移动号令并同步移动',
            width: '24px',
            marginRight: '1px',

            eventOnClick () {
                TeamworkHelper.move('n');
            }
        }, {
            label: '↗',
            title: '队长功能：往右上走一步...\n\n注意：只有通过本按钮操作，队员才能监听到移动号令并同步移动',
            width: '24px',

            eventOnClick () {
                TeamworkHelper.move('ne');
            }
        }, {
            label: '左',
            title: '队长功能：往左走一步...\n\n注意：只有通过本按钮操作，队员才能监听到移动号令并同步移动',
            width: '24px',
            marginRight: '1px',

            eventOnClick () {
                TeamworkHelper.move('w');
            }
        }, {
            label: '杀',
            title: '叫杀当前地图的第一个 npc...',
            id: 'id-room-cleaner',
            width: '24px',
            marginRight: '1px',

            eventOnClick () {
                let npcs = Objects.Room.getAvailableNpcsV2();
                if (!npcs.length) {
                    log('这里没有任何 npc。');
                    return;
                }

                let combat = new Combat();
                combat.initialize(npcs[0], '杀死');
                combat.fire();
            }
        }, {
            label: '右',
            title: '队长功能：往右走一步...\n\n注意：只有通过本按钮操作，队员才能监听到移动号令并同步移动',
            width: '24px',

            eventOnClick () {
                TeamworkHelper.move('e');
            }
        }, {
            label: '↙',
            title: '队长功能：往左下走一步...\n\n注意：只有通过本按钮操作，队员才能监听到移动号令并同步移动',
            width: '24px',
            marginRight: '1px',

            eventOnClick () {
                TeamworkHelper.move('sw');
            }
        }, {
            label: '下',
            title: '队长功能：往下走一步...\n\n注意：只有通过本按钮操作，队员才能监听到移动号令并同步移动',
            width: '24px',
            marginRight: '1px',

            eventOnClick () {
                TeamworkHelper.move('s');
            }
        }, {
            label: '↘',
            title: '队长功能：往右下走一步...\n\n注意：只有通过本按钮操作，队员才能监听到移动号令并同步移动',
            width: '24px',

            eventOnClick () {
                TeamworkHelper.move('se');
            }
        }, {
            label: '自动杀',
            title: '队长功能：按钮保持按下状态时，通过上方方向操作按钮会移动完自动杀在场第一个 npc...\n\n注意：\n为了确保所有成员都在场，移动后 1.5 秒才叫杀',
            id: 'id-auto-kill',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    TeamworkHelper.enableAutoKill();
                } else {
                    TeamworkHelper.disableAutoKill();
                }
            }
        }, {
        }, {
            label: '逃跑叫杀',
            title: '先逃跑再重新进入叫杀...',
            id: 'id-escape-to-kill',

            async eventOnClick () {
                if (ButtonManager.simpleToggleButtonEvent(this)) {
                    if (!CombatStatus.inProgress()) {
                        let actionLink = Objects.Npc.getActionLink('杀死');
                        if (actionLink) {
                            await EscapeToKillHelper.start(actionLink);
                        } else {
                            window.alert('未指定切磋对象，请点击在场 npc 的名字到杀死选项界面或在战斗中点此按钮。');
                        }
                    } else {
                        await EscapeToKillHelper.start();
                    }
                }

                ButtonManager.resetButtonById(this.id);
                EscapeToKillHelper.stop();
                await ButtonManager.click('prev_combat;golook_room', 0);
            }
        }]
    }];

    class ButtonGroup {
        constructor (subject, buttons, offset) {
            this._subject = subject;
            this._buttons = buttons;
            this._offset = offset;
        }

        getSubject () {
            return this._subject;
        }

        getButtons () {
            return this._buttons;
        }

        getOffset () {
            return this._offset ? this._offset : 0;
        }
    }

    class ElementStyle {
        constructor (width, height, top, right, marginBottom, position, textAlign, background, backgroundColor, color, marginRight) {
            this._width = width;
            this._height = height;
            this._top = top;
            this._right = right;

            this._position = position;
            this._textAlign = textAlign;
            this._background = background;
            this._backgroundColor = backgroundColor;
            this._marginBottom = marginBottom;
            this._color = color;
            this._marginRight = marginRight;
        }

        getHeight () {
            return this._height;
        }

        getWidth () {
            return this._width;
        }

        getMarginBottom () {
            return this._marginBottom;
        }

        getMarginRight () {
            return this._marginRight;
        }

        getPosition () {
            return this._position;
        }

        getTextAlign () {
            return this._textAlign;
        }

        getBackground () {
            return this._background;
        }

        getColor () {
            return this._color;
        }

        getBackgroundColor () {
            return this._backgroundColor;
        }

        getRight () {
            return this._right;
        }

        getTop () {
            return this._top;
        }
    }

    class Button {
        constructor (conf) {
            this._id = conf.id;
            this._title = conf.title;
            this._eventOnClick = conf.eventOnClick;
            this._label = conf.label;
            this._style = new ElementStyle(conf.width, '', '', '', conf.marginBottom, '', '', '', conf.backgroundColor, conf.color, conf.marginRight);
            this._hidden = conf.hidden;
        }

        createHtmlElement (div) {
            if (this._hidden) return;

            this._element = document.createElement('button');
            div.appendChild(this._element);

            if (this._label) {
                this._element.innerText = this._label;
                this._element.name = this._element.innerText;
                this._element.style.fontSize = 'xx-small';
                this._element.addEventListener('click', this._eventOnClick);
                if (this._id) this._element.id = this._id;
                if (this._title) this._element.title = this._title;
                if (this._style.getColor()) this._element.style.color = this._style.getColor();
                if (this._style.getBackgroundColor()) this._element.style.backgroundColor = this._style.getBackgroundColor();
                if (this._style.getWidth()) this._element.style.width = this._style.getWidth();
            } else {
                this._element.style.border = 'none';
                this._element.style.background = 'rgba(0,0,0,0)';
                this._element.disabled = true;
            }

            this.refreshStyle();
        }

        refreshStyle () {
            this._element.style.width = this._style.getWidth();
            this._element.style.height = this._style.getHeight();
            this._element.style.marginBottom = this._style.getMarginBottom();
            this._element.style.marginRight = this._style.getMarginRight();
        }

        getId () {
            return this._id;
        }

        getTitle () {
            return this._title;
        }

        getLabel () {
            return this._label;
        }

        getEventOnClick () {
            return this._eventOnClick;
        }

        setStyle (style) {
            this._style = style;
        }

        getStyle () {
            return this._style;
        }
    }

    var HelperUiManager = {
        _groups: [],

        loadConfigurations (groupConfs) {
            for (let i = 0; i < groupConfs.length; i++) {
                HelperUiManager._groups.push(new ButtonGroup(groupConfs[i].subject, buildButtons(groupConfs[i].buttons), groupConfs[i].offset));
            }

            function buildButtons (buttonConfs) {
                let buttons = [];
                for (let i = 0; i < buttonConfs.length; i++) {
                    buttons.push(new Button(buttonConfs[i]));
                }
                return buttons;
            };
        },

        getGroups (subjects = []) {
            return HelperUiManager._groups.filter(v => !subjects.length || subjects.includes(v.getSubject()));
        },

        setDefaultStyles (subjects = []) {
            let groups = HelperUiManager.getGroups(subjects);
            for (let i = 0; i < groups.length; i++) {
                let buttons = groups[i].getButtons();
                for (let j = 0; j < buttons.length; j++) {
                    let width = buttons[j].getStyle().getWidth() ? buttons[j].getStyle().getWidth() : '75px';
                    let marginRight = buttons[j].getStyle().getMarginRight() ? buttons[j].getStyle().getMarginRight() : '';
                    let backgroundColor = buttons[j].getStyle().getBackgroundColor() ? buttons[j].getStyle().getBackgroundColor() : '';

                    buttons[j].setStyle(new ElementStyle(width, '22px', '', '', '1px', '', '', '', backgroundColor, '', marginRight));
                }
            }
        },

        drawFunctionalGroups (subjects = []) {
            HelperUiManager.setDefaultStyles();

            let groups = HelperUiManager.getGroups(subjects);
            let right = 0;
            for (let i = 0; i < groups.length; i++) {
                right = right + groups[i].getOffset();
                drawGroupButtons(drawGroupPanel(groups[i].getSubject(), right), groups[i]);
                right = right + 77;
            }

            function drawGroupButtons (div, group) {
                for (let j = 0; j < group.getButtons().length; j++) {
                    group.getButtons()[j].createHtmlElement(div);
                }
            }

            function drawGroupPanel (subject, right) {
                let div = HelperUiManager.drawDiv(subject, new ElementStyle('90px', '', '22px', right + 'px', '', 'absolute', 'center', 'rgba(0, 0, 0, 0)', ''));

                let label = document.createElement('label');
                label.style.fontSize = '8pt';
                label.style.marginBottom = '5px';
                label.style.display = 'inline-block';
                label.textContent = subject;
                div.appendChild(label);

                return div;
            }
        },

        drawMasterSwitch () {
            let button = document.createElement('button');
            button.style.width = '30px';
            button.style.height = '20px';
            button.style.position = 'absolute';
            button.style.top = '0px';
            button.style.right = '0px';
            button.name = button.innerHTML = button.value = '>>';

            button.addEventListener('click', function () {
                ButtonManager.simpleToggleButtonEvent(this, '<<');
                $('#generic-control-panel').fadeToggle('fast');
            });
            document.body.appendChild(button);
        },

        drawDiv (id, style) {
            let div = document.createElement('div');

            div.id = id;
            if (style.getTop()) div.style.top = style.getTop();
            if (style.getHeight()) div.style.height = style.getHeight();
            if (style.getRight()) div.style.right = style.getRight();
            if (style.getPosition()) div.style.position = style.getPosition();
            if (style.getTextAlign()) div.style.textAlign = style.getTextAlign();
            if (style.getBackground()) div.style.background = style.getBackground();
            if (style.getBackgroundColor()) div.style.backgroundColor = style.getBackgroundColor();
            if (style.getMarginBottom()) div.style.marginBottom = style.getMarginBottom();
            if (style.getWidth()) div.style.width = style.getWidth();

            document.body.appendChild(div);
            return div;
        },

        refreshDivs () {
            let subjects = HelperUiManager.getGroups().map(v => v.getSubject());
            let offsets = HelperUiManager.getGroups().map(v => v.getOffset());
            let right = 0;
            for (let i = 0; i < subjects.length; i++) {
                $('div').filter(function () {
                    return subjects[i] === $(this).attr('id') && !$(this).attr('hidden');
                }).each(function () {
                    right = right + offsets[i];
                    $(this).css('right', right);
                    right = right + 77;
                });
            }
        },

        drawControlCheckboxes () {
            let div = HelperUiManager.drawDiv('generic-control-panel', new ElementStyle('', '20px', '0px', '50px', '', 'absolute', 'right', 'white', ''));
            let subjects = HelperUiManager.getGroups().map(v => v.getSubject()).reverse();

            addCheckBox(div, '全选', '', '全选所有分组', function () {
                $('#generic-control-panel').find('input[type=checkbox]').filter(function () { return $(this).attr('id') !== '全选'; }).prop('checked', this.checked);
                $('div').filter(function () { return subjects.includes($(this).attr('id')); }).prop('hidden', !this.checked);
                HelperUiManager.refreshDivs();
            });

            subjects.forEach(function (subject) {
                addCheckBox(div, subject, '', '显示/隐藏 ' + subject + ' 对应的按钮组', function () {
                    $('div').filter(function () { return $(this).attr('id') === subject; }).prop('hidden', !this.checked);
                    refreshAllCheckedStatus(this.checked);
                    HelperUiManager.refreshDivs();
                });
            });

            function refreshAllCheckedStatus (checked) {
                if (!checked) {
                    $('#全选').prop('checked', false);
                } else {
                    let allChecked = $('#generic-control-panel').find('input[type=checkbox]').filter(function () {
                        return !$(this).prop('checked');
                    }).length === 1;

                    if (allChecked) $('#全选').prop('checked', true);
                }
            }

            function addCheckBox (div, label, toggleLabel, title, eventOnChange) {
                let checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = checkbox.id = label;
                checkbox.title = title;
                checkbox.style.float = 'left';
                checkbox.checked = true;
                checkbox.addEventListener('change', eventOnChange);

                div.insertBefore(checkbox, null);

                let checkboxLabel = document.createElement('label');
                checkboxLabel.textContent = label;
                checkboxLabel.style.float = 'left';
                checkboxLabel.style.fontSize = '9pt';
                checkboxLabel.style.marginRight = '5px';

                div.insertBefore(checkboxLabel, null);
            }
        }
    };

    function inintializeHelpButtons (conf) {
        HelperUiManager.loadConfigurations(conf);
        HelperUiManager.drawFunctionalGroups();
        HelperUiManager.drawControlCheckboxes();
        HelperUiManager.drawMasterSwitch();

        $('#id-leftover-tasks').click();
        $('#测试中功能').click();
    }

    inintializeHelpButtons(helperConfigurations);

    User.initialize();
    document.title = User.getNickName();

    window.unsafeWindow.webSocketMsg.prototype.originalDispatchMessage = window.unsafeWindow.gSocketMsg.dispatchMessage;
    window.unsafeWindow.gSocketMsg.dispatchMessage = function (message) {
        this.originalDispatchMessage(message);

        if (MessageMonitor.isEnabled()) {
            new MessageHandler(message).handle();
        }
    };
}, 1000);
