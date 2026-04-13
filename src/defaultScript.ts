import { ScriptData } from "./types";

export const defaultScript: ScriptData = [
  {
    "scene information": {
      "who": ["贤者", "捷风", "尚博勒"],
      "where": "LotusTown",
      "what": "中奖诈骗"
    },
    "initial position": [
      { "character": "贤者", "position": "Position 1" },
      { "character": "捷风", "position": "Position 2" },
      { "character": "尚博勒", "position": "Position 3" }
    ],
    "scene": [
      {
        "speaker": "捷风",
        "content": "贤者快快快！那边有好事",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "中景",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Standing Talking 2", "motion_detail": "" },
          { "character": "贤者", "state": "standing", "action": "Standing Thinking", "motion_detail": "" },
          { "character": "尚博勒", "state": "standing", "action": "Dance 1", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 1" },
          { "character": "捷风", "position": "Position 2" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "贤者",
        "content": "你又要瞎冲什么？",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "仰拍镜头",
        "Follow": 0,
        "actions": [
          { "character": "贤者", "state": "standing", "action": "Standing Talking 5", "motion_detail": "" },
          { "character": "尚博勒", "state": "standing", "action": "Standing Deny", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 1" },
          { "character": "捷风", "position": "Position 2" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "move": [
          { "character": "捷风", "destination": "Position 5" },
          { "character": "贤者", "destination": "Position 4" }
        ],
        "shot": "scene",
        "camera": 2,
        "current position": [
          { "character": "贤者", "position": "Position 1" },
          { "character": "捷风", "position": "Position 2" },
          { "character": "尚博勒", "position": "Position 3" }
        ]
      },
      {
        "speaker": "尚博勒",
        "content": "终极抽奖！限定皮肤直接领！",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "中景",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Standing Thinking", "motion_detail": "" },
          { "character": "贤者", "state": "standing", "action": "Standing Thinking", "motion_detail": "" },
          { "character": "尚博勒", "state": "standing", "action": "Standing Speech 2", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "捷风",
        "content": "限定皮肤？!必须冲！!",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "中景",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Standing Talking 5", "motion_detail": "" },
          { "character": "贤者", "state": "standing", "action": "Standing Thinking", "motion_detail": "" },
          { "character": "尚博勒", "state": "standing", "action": "Standing Speech 2", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "贤者",
        "content": "不靠谱吧……",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "中景",
        "Follow": 0,
        "actions": [
          { "character": "贤者", "state": "standing", "action": "Standing Puzzled", "motion_detail": "" },
          { "character": "尚博勒", "state": "standing", "action": "Standing Speech 2", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "捷风",
        "content": "哎呀，抽一下又不亏！",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "中景",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Standing Talking 5", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "尚博勒",
        "content": "恭喜！你是今天第一个中绝版限定皮肤的！",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "仰拍镜头",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Standing Happy", "motion_detail": "" },
          { "character": "贤者", "state": "standing", "action": "Standing Thinking", "motion_detail": "" },
          { "character": "尚博勒", "state": "standing", "action": "Standing Speech 2", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "捷风",
        "content": "我中了！我是欧皇！",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "仰拍镜头",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Joyful Jump", "motion_detail": "" },
          { "character": "尚博勒", "state": "standing", "action": "Standing Thinking", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "贤者",
        "content": "可以啊捷风！",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "仰拍镜头",
        "Follow": 0,
        "actions": [
          { "character": "贤者", "state": "standing", "action": "Standing Surprise", "motion_detail": "" },
          { "character": "尚博勒", "state": "standing", "action": "Standing Happy", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "尚博勒",
        "content": "领奖需先缴个税，流程正规，官方渠道，秒付秒领！",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "仰拍镜头",
        "Follow": 0,
        "actions": [
          { "character": "尚博勒", "state": "standing", "action": "Standing Speech 2", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "捷风",
        "content": "缴税就缴税！快给我皮肤！",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "仰拍镜头",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Joyful Jump", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "贤者",
        "content": "现在就去办！我陪你跑银行！",
        "shot_blend": "easein",
        "shot": "character",
        "shot_type": "近景",
        "Follow": 0,
        "actions": [
          { "character": "贤者", "state": "standing", "action": "Standing Surprise", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "尚博勒",
        "content": "到账了！此时不跑更待何时。",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "俯拍镜头",
        "Follow": 0,
        "actions": [
          { "character": "尚博勒", "state": "standing", "action": "Joyful Jump", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ],
        "motion_description": ""
      },
      {
        "move": [
          { "character": "尚博勒", "destination": "Position 6" }
        ],
        "shot": "scene",
        "camera": 2,
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 3" }
        ]
      },
      {
        "speaker": "贤者",
        "content": "人呢?!完了……",
        "shot_blend": "cut",
        "shot": "character",
        "shot_type": "中景",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Joyful Talking 1", "motion_detail": "" },
          { "character": "贤者", "state": "standing", "action": "Standing Thinking", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 6" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "捷风",
        "content": "他人呢？！我钱呢？！",
        "shot_blend": "easein",
        "shot": "character",
        "shot_type": "中近景",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Joyful Deny", "motion_detail": "" },
          { "character": "贤者", "state": "standing", "action": "Standing Thinking", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 6" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "捷风",
        "content": "我居然被骗了……",
        "shot_blend": "easein",
        "shot": "character",
        "shot_type": "全景",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Fight", "motion_detail": "" },
          { "character": "贤者", "state": "standing", "action": "Standing Upset 1", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 6" }
        ],
        "motion_description": ""
      },
      {
        "speaker": "贤者",
        "content": "先交钱再领奖，百分百诈骗啊！",
        "shot_blend": "easein",
        "shot": "character",
        "shot_type": "全景",
        "Follow": 0,
        "actions": [
          { "character": "捷风", "state": "standing", "action": "Standing Crying", "motion_detail": "" },
          { "character": "贤者", "state": "standing", "action": "Standing Thinking", "motion_detail": "" }
        ],
        "current position": [
          { "character": "贤者", "position": "Position 4" },
          { "character": "捷风", "position": "Position 5" },
          { "character": "尚博勒", "position": "Position 6" }
        ],
        "motion_description": ""
      }
    ]
  }
];
