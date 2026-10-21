import type { I18nLocale } from '#shared/types'

export default {
  'nuxtSiteConfig': {
    'name': 'Everglow',
    'description': '아름다운 그래픽과 새로운 모험을 선사하는 Terraria 대형 모드, Everglow를 다운로드하세요.',
  },
  'meta': {
    'team': 'Dream Chaser Group',
  },
  'head': {
    'fulltitle': 'Everglow - Terraria 모드',
    'fulltitle2': '공식 웹사이트',
    'title': 'Everglow',
    'descriptions': {
      'news': 'Everglow 개발 일지, 출시 소식, 콘텐츠 미리보기 등 Dream Chaser Group의 최신 소식을 만나보세요.',
      'docs': 'Everglow 모드의 설치 안내, 개발 문서, 코드 예제를 살펴보세요.',
      'about': 'Everglow를 만드는 Dream Chaser Group의 소개, 연락처, 커뮤니티와 기여 방법을 확인하세요.',
    },
    'subtitles': {
      'news': '소식',
      'wiki': '위키',
      'docs': '문서',
      'about': '팀 소개',
    },
  },
  'body': {
    'footer': {
      'introduction': '{game} 모드 Everglow의 공식 웹사이트입니다.',
      'gameCopyright': 'Terraria와 모든 관련 콘텐츠의 저작권은 Re-Logic에 있습니다.',
      'copyright': '© {year} Dream Chaser Group',
    },
    'header': {
      'openMenu': '메뉴 열기',
      'closeMenu': '메뉴 닫기',
      'backToMenu': '메인 메뉴로 돌아가기',
      'name': 'Everglow',
      'home': '홈',
      'news': '소식',
      'wiki': '위키',
      'docs': '문서',
      'about': '팀 소개',
      'settings': {
        'languages': {
          'zh-cn': '简体中文',
          'en-us': 'English',
          'zh-hk': '繁体中文',
          'ja-jp': '日本語',
          'ko-kr': '한국어',
        },
      },
    },
  },
  'common': {
    'toc': {
      'title': '목차',
    },
  },
  'news': {
    'chevron-text': '더 읽기',
  },
  'home': {
    'hero': {
      'description': 'Everglow의 세계에 오신 것을 환영합니다! 아름다운 그래픽과 풍성한 콘텐츠로 테라리안 여러분에게 새롭고 신선한 모험을 선사하는 대형 모드입니다.',
      'getMod': '모드 다운로드',
      'getModDescription': '설치 안내를 확인하고 tModLoader에서 구독하세요',
      'github': 'GitHub',
      'githubDescription': '소스 코드, 개발 버전, 기여 방법',
      'tmodloader': 'tModLoader',
    },
    'community': {
      'discord': 'Discord',
      'bilibili': 'Bilibili',
      'qq': 'QQ 그룹',
    },
    'news': {
      'more': '소식 더 보기',
      'placeholderTitle': '반기 소식 · 공개 예정',
      'placeholderDescription': '새로운 소식을 준비하고 있습니다.',
    },
    'lore': {
      'eyebrow': '세계관',
      'title': '세계',
      'comingSoon': '공개 예정',
    },
  },
  'docs': {
    'label': {
      'Getting Started': '시작하기',
      'Netcode': '네트워크',
      'Mechanics': '게임 시스템',
      'Drawcode': '렌더링',
      'Game Content': '게임 콘텐츠',
      'Weapons': '무기',
    },
    'empty': {
      'title': '콘텐츠를 찾을 수 없습니다',
      'description': '아직 콘텐츠가 없습니다.',
    },
  },
} satisfies I18nLocale
