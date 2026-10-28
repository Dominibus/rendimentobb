import importlib.util,unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('builder',Path(__file__).resolve().parent.parent/'scripts/build-omi-context.py');builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
class OMITests(unittest.TestCase):
    def test_decimal_comma_and_distinct_surfaces(self):
        self.assertEqual(builder.pair('4,9','7,3','L'),[4.9,7.3,'L']);self.assertEqual(builder.pair('8','12','N'),[8,12,'N'])
    def test_missing_and_source_zero_are_not_numeric_zero(self):
        self.assertEqual(builder.pair('','',' '),[None,None,None]);self.assertEqual(builder.pair('0','0','L'),[None,None,'L'])
    def test_invalid_values_fail_closed(self):
        for values in [('','1','L'),('5','1','L'),('-2','4','L'),('NaN','10','L'),('1','Infinity','L'),('1','2','X')]:
            with self.subTest(values=values),self.assertRaises(ValueError):builder.pair(*values)
    def test_section_and_link_are_part_of_zone_identity(self):
        a={'Comune_amm':'H501','Sez':' ','Zona':'B1','LinkZona':'RM001'};b={**a,'Sez':'A'}
        self.assertNotEqual(builder.zonekey(a),builder.zonekey(b))
