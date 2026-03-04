// dungeon/i18n.js — Translation dictionary for dungeon UI
// Extracted from dungeon.js init() (Step 6G)
// Safety: No THREE/MMD_SA references. Pure data.
(function () {
var d = MMD_SA_options.Dungeon;

d._initTranslations = function () {
System._browser.translation.dictionary = {
	"Dungeon": {
		"UI": {
			"backpack": {
				"_translation_": {
					"_default_": "Backpack",
					"ja": "バックパック",
					"zh": "背包"
				}
			},
			"tome": {
				"settings": {
					"UI_and_overlays": {
						"user_interface": {
							"_translation_": {
								"_default_": "User interface",
								"ja": "ユーザーインターフェース",
								"zh": "使用者介面"
							},
							"UI_off": {
								"_translation_": {
									"_default_": "User interface is now OFF. Press Esc to toggle the bottom menu display.",
									"ja": "ユーザーインターフェースはオフになりました。 Esc キーを押すと、下部のメニュー表示が切り替わります。",
									"zh": "使用者介面現已關閉。 按 Esc 鍵切換下方介面的顯示。"
								},
								"mobile": {
									"_translation_": {
										"_default_": "User interface is now OFF. Touch and hold for 1 second, and press / key to toggle the bottom menu display.",
										"ja": "ユーザーインターフェースはオフになりました。 1 秒間タッチしたままにして、/ キーを押すと、下部のメニュー表示が切り替わります。",
										"zh": "使用者介面現已關閉。 點擊螢幕並按住 1 秒鐘，然後按 / 鍵切換下方介面的顯示。"
									}
								},
								"green_screen": {
									"_translation_": {
										"_default_": "green screen",
										"ja": "グリーンスクリーン",
										"zh": "綠幕"
									}
								}
							}
						},
						"camera_display": {
							"_translation_": {
								"_default_": "Video input display",
								"ja": "ビデオ入力表示",
								"zh": "影像輸入顯示"
							},
							"non_webcam": {
								"_translation_": {
									"_default_": "Non-webcam",
									"ja": "非ウェブカメラ",
									"zh": "非網路攝影機"
								}
							}
						},
						"wireframe_display": {
							"_translation_": {
								"_default_": "Wireframe display",
								"ja": "ワイヤーフレーム表示",
								"zh": "線框顯示"
							}
						},
						"mocap_debug_display": {
							"_translation_": {
								"_default_": "Mocap debug display",
								"ja": "モーキャプのデバッグ表示",
								"zh": "動捕偵錯顯示"
							}
						},
						"UI_sound_effects": {
							"_translation_": {
								"_default_": "UI sound effects",
								"ja": "UI音響効果",
								"zh": "介面聲效"
							}
						},
						"UI_language": {
							"_translation_": {
								"_default_": "UI language",
								"ja": "UI言語",
								"zh": "介面語言"
							}
						}
					}
				}
			}
		}
	},
	"Misc": {
		"done": {
			"_translation_": {
				"_default_": "Done",
				"ja": "終了",
				"zh": "結束"
			}
		},
		"finish": {
			"_translation_": {
				"_default_": "Finish",
				"ja": "終了",
				"zh": "完成"
			}
		},
		"cancel": {
			"_translation_": {
				"_default_": "Cancel",
				"ja": "キャンセル",
				"zh": "取消"
			}
		},
		"default": {
			"_translation_": {
				"_default_": "Default",
				"ja": "デフォルト",
				"zh": "預設"
			}
		},
		"none": {
			"_translation_": {
				"_default_": "None",
				"ja": "なし",
				"zh": "沒有"
			}
		},
		"full": {
			"_translation_": {
				"_default_": "Full",
				"ja": "フル",
				"zh": "完全"
			}
		},
		"Full": {
			"_translation_": {
				"_default_": "Full",
				"ja": "フル",
				"zh": "完全"
			}
		},
		"yes": {
			"_translation_": {
				"_default_": "Yes",
				"ja": "はい",
				"zh": "是"
			}
		},
		"no": {
			"_translation_": {
				"_default_": "No",
				"ja": "いいえ",
				"zh": "否"
			}
		},
		"others": {
			"_translation_": {
				"_default_": "Others",
				"ja": "その他",
				"zh": "其他"
			}
		},
		"auto": {
			"_translation_": {
				"_default_": "Auto",
				"ja": "自動",
				"zh": "自動"
			}
		},
		"Normal": {
			"_translation_": {
				"_default_": "Normal",
				"ja": "普通",
				"zh": "普通"
			}
		},
		"Medium": {
			"_translation_": {
				"_default_": "Medium",
				"ja": "中",
				"zh": "中"
			}
		},
		"Low": {
			"_translation_": {
				"_default_": "Low",
				"ja": "低",
				"zh": "低"
			}
		},
		"High": {
			"_translation_": {
				"_default_": "High",
				"ja": "高",
				"zh": "高"
			}
		},
		"Very high": {
			"_translation_": {
				"_default_": "Very high",
				"ja": "とても高い",
				"zh": "非常高"
			}
		},
		"Max": {
			"_translation_": {
				"_default_": "Max",
				"ja": "最大",
				"zh": "最大"
			}
		},
		"Min": {
			"_translation_": {
				"_default_": "Min",
				"ja": "最小",
				"zh": "最小"
			}
		},
		"Best": {
			"_translation_": {
				"_default_": "Best",
				"ja": "最高",
				"zh": "最佳"
			}
		},
		"Small": {
			"_translation_": {
				"_default_": "Small",
				"ja": "小",
				"zh": "小"
			}
		},
		"Large": {
			"_translation_": {
				"_default_": "Large",
				"ja": "大",
				"zh": "大"
			}
		}
	}
};
};
})();
