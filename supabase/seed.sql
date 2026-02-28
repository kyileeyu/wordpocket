-- ============================================
-- WordPocket: 테스트용 시드 데이터
-- 주의: 로컬 개발 환경에서만 사용
-- supabase db reset 실행 시 자동 삽입
-- ============================================

-- 로컬 개발 시 supabase dashboard에서 테스트 유저 생성 후
-- 해당 user_id를 아래 변수에 대입하여 사용
DO $$
DECLARE
  test_user_id UUID := '00000000-0000-0000-0000-000000000001';
  folder_english UUID;
  folder_japanese UUID;
  deck_toeic UUID;
  deck_business UUID;
  deck_jlpt UUID;
BEGIN

-- 폴더 생성
INSERT INTO folders (id, user_id, name, color, sort_order)
VALUES (gen_random_uuid(), test_user_id, '영어', '#3b82f6', 0)
RETURNING id INTO folder_english;

INSERT INTO folders (id, user_id, name, color, sort_order)
VALUES (gen_random_uuid(), test_user_id, '일본어', '#ef4444', 1)
RETURNING id INTO folder_japanese;

-- 덱 생성
INSERT INTO decks (id, user_id, folder_id, name, description, color, sort_order)
VALUES (gen_random_uuid(), test_user_id, folder_english, 'TOEIC 필수 단어', 'TOEIC 빈출 단어 모음', '#3b82f6', 0)
RETURNING id INTO deck_toeic;

INSERT INTO decks (id, user_id, folder_id, name, description, color, sort_order)
VALUES (gen_random_uuid(), test_user_id, folder_english, '비즈니스 영어', '비즈니스 상황 필수 표현', '#10b981', 1)
RETURNING id INTO deck_business;

INSERT INTO decks (id, user_id, folder_id, name, description, color, sort_order)
VALUES (gen_random_uuid(), test_user_id, folder_japanese, 'JLPT N3', 'JLPT N3 필수 단어', '#ef4444', 0)
RETURNING id INTO deck_jlpt;

-- TOEIC 필수 단어 카드
INSERT INTO cards (deck_id, word, meaning, example, pronunciation, tags) VALUES
  (deck_toeic, 'accommodate', '수용하다, 편의를 도모하다', 'The hotel can accommodate up to 500 guests.', 'əˈkɑːmədeɪt', '{toeic,verb}'),
  (deck_toeic, 'implement', '시행하다, 구현하다', 'We need to implement the new policy by next month.', 'ˈɪmplɪment', '{toeic,verb}'),
  (deck_toeic, 'revenue', '수익, 세입', 'The company reported a 20% increase in revenue.', 'ˈrevənjuː', '{toeic,noun,finance}'),
  (deck_toeic, 'complimentary', '무료의, 칭찬하는', 'The hotel offers complimentary breakfast.', 'ˌkɑːmplɪˈmentəri', '{toeic,adjective}'),
  (deck_toeic, 'prospective', '장래의, 예상되는', 'We have a meeting with prospective clients.', 'prəˈspektɪv', '{toeic,adjective}'),
  (deck_toeic, 'adjacent', '인접한', 'The parking lot is adjacent to the building.', 'əˈdʒeɪsnt', '{toeic,adjective}'),
  (deck_toeic, 'reimburse', '상환하다, 변상하다', 'The company will reimburse your travel expenses.', 'ˌriːɪmˈbɜːrs', '{toeic,verb,finance}'),
  (deck_toeic, 'mandatory', '의무적인', 'Attendance at the meeting is mandatory.', 'ˈmændətɔːri', '{toeic,adjective}'),
  (deck_toeic, 'itinerary', '여행 일정', 'Please review the itinerary before the trip.', 'aɪˈtɪnəreri', '{toeic,noun,travel}'),
  (deck_toeic, 'prerequisite', '전제 조건', 'A bachelor''s degree is a prerequisite for the position.', 'ˌpriːˈrekwəzɪt', '{toeic,noun}');

-- 비즈니스 영어 카드
INSERT INTO cards (deck_id, word, meaning, example, pronunciation, tags) VALUES
  (deck_business, 'synergy', '시너지, 상승 효과', 'The merger created significant synergy between the two companies.', 'ˈsɪnərdʒi', '{business,noun}'),
  (deck_business, 'leverage', '활용하다, 지렛대', 'We should leverage our existing network.', 'ˈlevərɪdʒ', '{business,verb}'),
  (deck_business, 'stakeholder', '이해관계자', 'All stakeholders must approve the proposal.', 'ˈsteɪkhoʊldər', '{business,noun}'),
  (deck_business, 'scalable', '확장 가능한', 'We need a scalable solution for growing demand.', 'ˈskeɪləbl', '{business,adjective,tech}'),
  (deck_business, 'benchmark', '기준점, 벤치마크', 'This report sets a benchmark for future performance.', 'ˈbentʃmɑːrk', '{business,noun}');

-- JLPT N3 카드
INSERT INTO cards (deck_id, word, meaning, example, pronunciation, tags) VALUES
  (deck_jlpt, '経験', '경험', '海外で働いた経験がありますか。', 'けいけん', '{jlpt,n3,noun}'),
  (deck_jlpt, '届ける', '전해주다, 배달하다', '荷物を届けてください。', 'とどける', '{jlpt,n3,verb}'),
  (deck_jlpt, '信じる', '믿다', '自分を信じてください。', 'しんじる', '{jlpt,n3,verb}'),
  (deck_jlpt, '複雑', '복잡하다', 'この問題は複雑です。', 'ふくざつ', '{jlpt,n3,adjective}'),
  (deck_jlpt, '相談', '상담', '先生に相談したいです。', 'そうだん', '{jlpt,n3,noun}');

END $$;
