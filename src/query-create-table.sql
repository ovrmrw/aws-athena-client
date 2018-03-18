CREATE EXTERNAL TABLE IF NOT EXISTS arangodb_example_datasets.random_users (
  `name` struct < `first` :string, `last` :string >,
  `gender` string,
  `birthday` string,
  `contact` struct <
    `address` :struct < `street` :string, `zip` :string, `city` :string, `state` :string >,
    `email` :array<string>,
    `region` :string,
    `phone` :array<string>
  >,
  `likes` array<string>,
  `memberSince` string
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
WITH SERDEPROPERTIES (
  'serialization.format' = '1'
) LOCATION 's3://json-big-data/arangodb/example-datasets/RandomUsers/'
TBLPROPERTIES ('has_encrypted_data'='false');
