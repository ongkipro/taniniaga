WITH defaults(courier_code) AS (
	VALUES
		('JNE'),
		('SiCepat'),
		('J&T'),
		('SAP'),
		('Ninja'),
		('Anteraja'),
		('Lion'),
		('IDexpress'),
		('Paxel'),
		('Pos')
)
INSERT INTO courier_rules (
	store_id,
	courier_code,
	is_enabled,
	is_cod_enabled
)
SELECT stores.id, defaults.courier_code, 1, 1
FROM stores
CROSS JOIN defaults
WHERE NOT EXISTS (
	SELECT 1
	FROM courier_rules
	WHERE courier_rules.store_id = stores.id
		AND lower(courier_rules.courier_code) = lower(defaults.courier_code)
);
