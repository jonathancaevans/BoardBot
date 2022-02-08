import React, {useRef, useEffect, useState, Fragment} from 'react';
import * as tf from "@tensorflow/tfjs"
import './index.css';

import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from "react-toastify";

import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from "react-loader-spinner";

function gradeNorm(grader, holds, angle)
{
	const gradeLabels = [['4a','V0'],['4b','V0'],['4c','V0'],['5a','V1'],['5b','V1'],['5c','V2'],['6a','V3'],['6a+','V3'],['6b','V4'],['6b+','V4'],['6c','V5'],['6c+','V5'],['7a','V6'],['7a+','V7'],['7b','V8'],['7b+','V8'],['7c','V9'],['7c+','V10'],['8a','V11'],['8a+','V12'],['8b','V13'],['8b+','V14'],['8c','V15'],['8c+','V16']];

	let grade = grader.predict([tf.tensor([holds]),tf.tensor([((angle/5)/14)])]);

	return {"gradeLabel":gradeLabels[Math.round(grade.dataSync()[0]*23)],"gradeIndex":Math.round(grade.dataSync()[0]*23)+10};
}

function visToPlacements(visualdisplay)
{
	let placements = [];

	visualdisplay.forEach(function (placement, index) {
		let role_id = 15;
		if(placement[1] === "finish"){
			role_id = 14;
		} else if (placement[1] === "start"){
			role_id = 12;
		} else if (placement[1] === "mid"){
			role_id = 13;
		}
		let newPlacement = {'placement_id': placement[0], 'role_id': role_id, 'frame': 0};
		placements.push(newPlacement);
	});

	return placements;
}

function placementsToNorm(body, idmap)
{
	let holds = []
	let pointer = 0;

	for(let i = 0; i < 36; i++)
	{
		let x = []
		for(let j = 0; j < 18; j++)
		{
			let value = [-1,-1,-1,-1]
			for(let pointer = 0; pointer < body.length; pointer++)
			{
				if(idmap[i][j] === body[pointer]['placement_id'])
				{
					if(body[pointer]['placement_id']['role_id'] === 13)
					{
						value[0] = 1
					}
					else if(body[pointer]['placement_id']['role_id'] === 15)
					{
						value[1] = 1
					}
					else if(body[pointer]['placement_id']['role_id'] === 12)
					{
						value[2] = 1
					}
					else
					{
						value[3] = 1
					}
				}
			}
			x.push(value)
		}
		holds.push(x)
	}

	return holds;
}

function normToVis(norm, idmap)
{
	var visualdisplay = []

	for(let i = 0; i < 36; i++)
	{
		for(let j = 0; j < 18; j++)
		{
			if(norm[i][j][3] > 0)
			{
				let list = [idmap[i][j], "finish"]
				visualdisplay.push(list)
			}
			else if(norm[i][j][2] > 0)
			{
				let list = [idmap[i][j], "start"]
				visualdisplay.push(list)
			}
			else if(norm[i][j][0] > 0)
			{
				let list = [idmap[i][j], "mid"]
				visualdisplay.push(list)
			}
			else if(norm[i][j][1] > 0)
			{
				let list = [idmap[i][j], "feet"]
				visualdisplay.push(list)
			}
		}
	}
	return visualdisplay
}

const App = () => {
	const idmap = [[1379, 1380, 1381, 1382, 1383, 1384, 1385, 1386, 1387, 1388, 1389, 1390, 1391, 1392, 1393, 1394, 1395, 0], [1362, 1363, 1364, 1365, 1366, 1367, 1368, 1369, 1370, 1371, 1372, 1373, 1374, 1375, 1376, 1377, 1378, 0], [1345, 1346, 1347, 1348, 1349, 1350, 1351, 1352, 1353, 1354, 1355, 1356, 1357, 1358, 1359, 1360, 1361, 0], [1591, 0, 1592, 0, 1593, 0, 1594, 0, 1595, 0, 1596, 0, 1597, 0, 1598, 0, 1599, 0], [1328, 1329, 1330, 1331, 1332, 1333, 1334, 1335, 1336, 1337, 1338, 1339, 1340, 1341, 1342, 1343, 1344, 0], [1582, 0, 1583, 0, 1584, 0, 1585, 0, 1586, 0, 1587, 0, 1588, 0, 1589, 0, 1590, 0], [1311, 1312, 1313, 1314, 1315, 1316, 1317, 1318, 1319, 1320, 1321, 1322, 1323, 1324, 1325, 1326, 1327, 0], [1573, 0, 1574, 0, 1575, 0, 1576, 0, 1577, 0, 1578, 0, 1579, 0, 1580, 0, 1581, 0], [1294, 1295, 1296, 1297, 1298, 1299, 1300, 1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1310, 0], [1564, 0, 1565, 0, 1566, 0, 1567, 0, 1568, 0, 1569, 0, 1570, 0, 1571, 0, 1572, 0], [1277, 1278, 1279, 1280, 1281, 1282, 1283, 1284, 1285, 1286, 1287, 1288, 1289, 1290, 1291, 1292, 1293, 0], [1555, 0, 1556, 0, 1557, 0, 1558, 0, 1559, 0, 1560, 0, 1561, 0, 1562, 0, 1563, 0], [1260, 1261, 1262, 1263, 1264, 1265, 1266, 1267, 1268, 1269, 1270, 1271, 1272, 1273, 1274, 1275, 1276, 0], [1546, 0, 1547, 0, 1548, 0, 1549, 0, 1550, 0, 1551, 0, 1552, 0, 1553, 0, 1554, 0], [1243, 1244, 1245, 1246, 1247, 1248, 1249, 1250, 1251, 1252, 1253, 1254, 1255, 1256, 1257, 1258, 1259, 0], [1537, 0, 1538, 0, 1539, 0, 1540, 0, 1541, 0, 1542, 0, 1543, 0, 1544, 0, 1545, 0], [1226, 1227, 1228, 1229, 1230, 1231, 1232, 1233, 1234, 1235, 1236, 1237, 1238, 1239, 1240, 1241, 1242, 0], [1528, 0, 1529, 0, 1530, 0, 1531, 0, 1532, 0, 1533, 0, 1534, 0, 1535, 0, 1536, 0], [1209, 1210, 1211, 1212, 1213, 1214, 1215, 1216, 1217, 1218, 1219, 1220, 1221, 1222, 1223, 1224, 1225, 0], [1519, 0, 1520, 0, 1521, 0, 1522, 0, 1523, 0, 1524, 0, 1525, 0, 1526, 0, 1527, 0], [1192, 1193, 1194, 1195, 1196, 1197, 1198, 1199, 1200, 1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208, 0], [1510, 0, 1511, 0, 1512, 0, 1513, 0, 1514, 0, 1515, 0, 1516, 0, 1517, 0, 1518, 0], [1175, 1176, 1177, 1178, 1179, 1180, 1181, 1182, 1183, 1184, 1185, 1186, 1187, 1188, 1189, 1190, 1191, 0], [1501, 0, 1502, 0, 1503, 0, 1504, 0, 1505, 0, 1506, 0, 1507, 0, 1508, 0, 1509, 0], [1158, 1159, 1160, 1161, 1162, 1163, 1164, 1165, 1166, 1167, 1168, 1169, 1170, 1171, 1172, 1173, 1174, 0], [1492, 0, 1493, 0, 1494, 0, 1495, 0, 1496, 0, 1497, 0, 1498, 0, 1499, 0, 1500, 0], [1141, 1142, 1143, 1144, 1145, 1146, 1147, 1148, 1149, 1150, 1151, 1152, 1153, 1154, 1155, 1156, 1157, 0], [1483, 0, 1484, 0, 1485, 0, 1486, 0, 1487, 0, 1488, 0, 1489, 0, 1490, 0, 1491, 0], [1124, 1125, 1126, 1127, 1128, 1129, 1130, 1131, 1132, 1133, 1134, 1135, 1136, 1137, 1138, 1139, 1140, 0], [1474, 0, 1475, 0, 1476, 0, 1477, 0, 1478, 0, 1479, 0, 1480, 0, 1481, 0, 1482, 0], [1107, 1108, 1109, 1110, 1111, 1112, 1113, 1114, 1115, 1116, 1117, 1118, 1119, 1120, 1121, 1122, 1123, 0], [1465, 0, 1466, 0, 1467, 0, 1468, 0, 1469, 0, 1470, 0, 1471, 0, 1472, 0, 1473, 0], [1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099, 1100, 1101, 1102, 1103, 1104, 1105, 1106, 0], [1089, 1088, 1087, 1086, 1085, 1084, 1083, 1082, 1081, 1080, 1079, 1078, 1077, 1076, 1075, 1074, 1073, 0], [1464, 1463, 1462, 1461, 1460, 1459, 1458, 1457, 1456, 1455, 1454, 1453, 1452, 1451, 1450, 1449, 1448, 1447], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]

	const vismap = [[1379, 66, 32, 46], [1380, 124, 31, 46], [1381, 181, 32, 54], [1382, 240, 32, 45], [1383, 302, 34, 45], [1384, 362, 30, 46], [1385, 420, 32, 47], [1386, 480, 32, 49], [1387, 538, 30, 43], [1388, 600, 30, 55], [1389, 660, 30, 48], [1390, 720, 30, 43], [1391, 774, 32, 48], [1392, 839, 32, 48], [1393, 900, 28, 53], [1394, 958, 28, 51], [1395, 1016, 32, 51], [1362, 63, 98, 48], [1363, 123, 95, 40], [1364, 182, 93, 54], [1365, 244, 93, 40], [1366, 302, 92, 39], [1367, 359, 94, 46], [1368, 418, 94, 45], [1369, 479, 93, 40], [1370, 538, 94, 40], [1371, 596, 91, 50], [1372, 661, 92, 49], [1373, 719, 92, 36], [1374, 775, 91, 38], [1375, 839, 96, 46], [1376, 898, 92, 43], [1377, 956, 92, 37], [1378, 1017, 94, 44], [1345, 64, 158, 48], [1346, 124, 152, 45], [1347, 182, 152, 43], [1348, 244, 153, 40], [1349, 300, 155, 45], [1350, 356, 150, 45], [1351, 422, 152, 38], [1352, 478, 156, 47], [1353, 541, 148, 54], [1354, 600, 151, 42], [1355, 658, 152, 49], [1356, 720, 151, 38], [1357, 780, 154, 41], [1358, 838, 150, 39], [1359, 900, 150, 49], [1360, 958, 152, 43], [1361, 1012, 150, 43], [1591, 32, 184, 21], [1592, 152, 182, 21], [1593, 270, 182, 25], [1594, 388, 180, 21], [1595, 510, 182, 19], [1596, 632, 183, 22], [1597, 748, 177, 22], [1598, 871, 179, 22], [1599, 990, 182, 19], [1328, 66, 213, 33], [1329, 123, 214, 41], [1330, 185, 215, 38], [1331, 238, 212, 43], [1332, 302, 212, 45], [1333, 366, 212, 54], [1334, 419, 210, 39], [1335, 483, 212, 41], [1336, 540, 212, 36], [1337, 598, 214, 48], [1338, 660, 211, 40], [1339, 718, 215, 46], [1340, 778, 212, 49], [1341, 840, 212, 46], [1342, 892, 211, 47], [1343, 955, 213, 42], [1344, 1019, 214, 46], [1582, 92, 244, 20], [1583, 210, 246, 22], [1584, 334, 244, 21], [1585, 450, 243, 21], [1586, 571, 244, 20], [1587, 690, 244, 22], [1588, 811, 245, 22], [1589, 931, 244, 20], [1590, 1051, 246, 21], [1311, 62, 270, 41], [1312, 126, 268, 40], [1313, 184, 272, 39], [1314, 242, 270, 45], [1315, 301, 270, 44], [1316, 360, 271, 41], [1317, 420, 272, 39], [1318, 480, 267, 44], [1319, 540, 271, 50], [1320, 598, 272, 45], [1321, 658, 272, 37], [1322, 721, 274, 50], [1323, 780, 271, 46], [1324, 838, 271, 35], [1325, 902, 278, 43], [1326, 958, 272, 49], [1327, 1014, 272, 35], [1573, 32, 302, 23], [1574, 153, 301, 24], [1575, 272, 303, 20], [1576, 392, 304, 23], [1577, 510, 302, 26], [1578, 630, 298, 25], [1579, 750, 304, 22], [1580, 868, 306, 20], [1581, 991, 306, 21], [1294, 64, 328, 49], [1295, 124, 331, 44], [1296, 184, 330, 44], [1297, 243, 331, 48], [1298, 302, 330, 49], [1299, 361, 330, 38], [1300, 422, 328, 45], [1301, 478, 330, 47], [1302, 543, 328, 46], [1303, 597, 330, 38], [1304, 660, 333, 42], [1305, 720, 332, 37], [1306, 776, 330, 56], [1307, 838, 332, 39], [1308, 899, 330, 54], [1309, 958, 334, 37], [1310, 1014, 330, 39], [1564, 92, 363, 22], [1565, 210, 362, 17], [1566, 332, 358, 21], [1567, 448, 362, 21], [1568, 570, 360, 21], [1569, 684, 365, 24], [1570, 808, 362, 21], [1571, 928, 358, 23], [1572, 1050, 362, 21], [1277, 62, 388, 48], [1278, 124, 390, 43], [1279, 180, 392, 43], [1280, 237, 390, 52], [1281, 304, 386, 50], [1282, 362, 392, 42], [1283, 416, 389, 44], [1284, 474, 386, 51], [1285, 539, 390, 49], [1286, 597, 391, 40], [1287, 658, 389, 48], [1288, 718, 390, 41], [1289, 774, 390, 33], [1290, 836, 389, 48], [1291, 895, 392, 49], [1292, 955, 391, 50], [1293, 1014, 388, 51], [1555, 32, 426, 21], [1556, 152, 422, 27], [1557, 270, 422, 24], [1558, 394, 424, 18], [1559, 510, 426, 23], [1560, 626, 424, 22], [1561, 748, 422, 23], [1562, 868, 424, 18], [1563, 989, 420, 28], [1260, 62, 450, 52], [1261, 120, 448, 41], [1262, 184, 450, 47], [1263, 240, 452, 35], [1264, 295, 458, 52], [1265, 362, 450, 39], [1266, 418, 452, 48], [1267, 476, 452, 45], [1268, 538, 455, 42], [1269, 600, 450, 49], [1270, 656, 450, 44], [1271, 718, 456, 49], [1272, 779, 454, 42], [1273, 835, 454, 50], [1274, 894, 446, 43], [1275, 956, 448, 45], [1276, 1020, 448, 52], [1546, 96, 482, 27], [1547, 214, 484, 23], [1548, 332, 484, 23], [1549, 453, 484, 22], [1550, 574, 484, 25], [1551, 692, 482, 22], [1552, 810, 480, 24], [1553, 928, 482, 22], [1554, 1052, 480, 22], [1243, 65, 510, 48], [1244, 123, 512, 36], [1245, 184, 516, 47], [1246, 244, 511, 44], [1247, 298, 510, 40], [1248, 360, 511, 34], [1249, 417, 513, 38], [1250, 480, 514, 45], [1251, 541, 510, 40], [1252, 596, 512, 41], [1253, 661, 512, 44], [1254, 717, 512, 49], [1255, 776, 513, 38], [1256, 840, 512, 45], [1257, 896, 508, 48], [1258, 951, 506, 41], [1259, 1018, 507, 44], [1537, 34, 544, 21], [1538, 157, 544, 21], [1539, 274, 542, 24], [1540, 393, 544, 22], [1541, 512, 542, 23], [1542, 629, 542, 22], [1543, 748, 541, 24], [1544, 872, 541, 24], [1545, 987, 538, 24], [1226, 64, 574, 41], [1227, 124, 570, 44], [1228, 184, 572, 51], [1229, 241, 572, 36], [1230, 300, 569, 42], [1231, 360, 573, 41], [1232, 420, 572, 45], [1233, 482, 570, 45], [1234, 538, 570, 52], [1235, 596, 570, 46], [1236, 661, 570, 43], [1237, 718, 572, 56], [1238, 776, 570, 47], [1239, 836, 566, 39], [1240, 898, 572, 34], [1241, 956, 572, 41], [1242, 1018, 568, 33], [1528, 92, 604, 17], [1529, 214, 604, 17], [1530, 334, 605, 23], [1531, 452, 604, 21], [1532, 571, 602, 20], [1533, 690, 602, 24], [1534, 810, 602, 20], [1535, 930, 600, 19], [1536, 1050, 598, 19], [1209, 62, 631, 43], [1210, 128, 630, 46], [1211, 186, 634, 52], [1212, 242, 632, 52], [1213, 301, 631, 42], [1214, 360, 633, 32], [1215, 418, 630, 37], [1216, 478, 630, 43], [1217, 538, 632, 53], [1218, 599, 632, 38], [1219, 662, 630, 50], [1220, 718, 630, 36], [1221, 776, 630, 51], [1222, 836, 631, 44], [1223, 901, 628, 44], [1224, 960, 632, 41], [1225, 1018, 629, 44], [1519, 33, 662, 22], [1520, 153, 660, 24], [1521, 274, 664, 23], [1522, 392, 662, 21], [1523, 512, 662, 22], [1524, 630, 661, 20], [1525, 750, 662, 26], [1526, 868, 660, 18], [1527, 991, 655, 24], [1192, 62, 688, 53], [1193, 121, 688, 42], [1194, 181, 688, 52], [1195, 240, 692, 38], [1196, 300, 690, 46], [1197, 362, 692, 46], [1198, 418, 690, 49], [1199, 481, 691, 40], [1200, 539, 688, 54], [1201, 595, 691, 44], [1202, 657, 691, 40], [1203, 718, 692, 47], [1204, 776, 691, 46], [1205, 836, 689, 47], [1206, 895, 688, 42], [1207, 960, 686, 47], [1208, 1018, 688, 42], [1510, 90, 717, 20], [1511, 214, 718, 23], [1512, 334, 720, 24], [1513, 452, 723, 23], [1514, 570, 722, 25], [1515, 688, 722, 22], [1516, 808, 723, 22], [1517, 929, 723, 24], [1518, 1050, 722, 26], [1175, 61, 746, 40], [1176, 122, 745, 44], [1177, 182, 752, 43], [1178, 242, 748, 41], [1179, 303, 753, 42], [1180, 364, 751, 48], [1181, 422, 751, 41], [1182, 483, 748, 39], [1183, 540, 754, 45], [1184, 597, 750, 39], [1185, 659, 754, 43], [1186, 718, 752, 49], [1187, 778, 754, 41], [1188, 836, 751, 38], [1189, 899, 753, 44], [1190, 958, 750, 41], [1191, 1016, 751, 50], [1501, 31, 776, 23], [1502, 148, 781, 26], [1503, 268, 778, 24], [1504, 390, 783, 20], [1505, 510, 784, 23], [1506, 629, 784, 21], [1507, 748, 784, 23], [1508, 868, 786, 21], [1509, 988, 782, 23], [1158, 62, 807, 37], [1159, 124, 808, 47], [1160, 183, 810, 46], [1161, 240, 810, 50], [1162, 304, 809, 36], [1163, 364, 806, 41], [1164, 420, 814, 43], [1165, 480, 810, 44], [1166, 540, 812, 55], [1167, 599, 814, 56], [1168, 656, 811, 41], [1169, 716, 810, 37], [1170, 778, 812, 47], [1171, 836, 812, 43], [1172, 896, 813, 42], [1173, 954, 809, 53], [1174, 1024, 808, 43], [1492, 92, 840, 25], [1493, 210, 841, 22], [1494, 330, 840, 22], [1495, 449, 844, 24], [1496, 570, 841, 22], [1497, 688, 843, 24], [1498, 808, 844, 24], [1499, 928, 844, 21], [1500, 1051, 844, 20], [1141, 62, 869, 48], [1142, 126, 870, 54], [1143, 184, 873, 51], [1144, 242, 869, 36], [1145, 302, 870, 47], [1146, 358, 873, 50], [1147, 416, 866, 44], [1148, 480, 868, 45], [1149, 538, 877, 49], [1150, 598, 872, 50], [1151, 657, 872, 46], [1152, 716, 868, 46], [1153, 778, 870, 47], [1154, 836, 870, 33], [1155, 897, 875, 50], [1156, 956, 870, 47], [1157, 1016, 870, 51], [1483, 30, 900, 23], [1484, 153, 900, 26], [1485, 274, 900, 24], [1486, 389, 901, 18], [1487, 509, 904, 24], [1488, 627, 904, 20], [1489, 747, 904, 20], [1490, 865, 904, 18], [1491, 988, 901, 24], [1124, 60, 928, 43], [1125, 120, 924, 47], [1126, 180, 926, 53], [1127, 243, 927, 48], [1128, 302, 932, 47], [1129, 360, 928, 49], [1130, 422, 932, 53], [1131, 480, 929, 45], [1132, 538, 930, 51], [1133, 600, 932, 43], [1134, 654, 934, 46], [1135, 720, 929, 52], [1136, 779, 931, 42], [1137, 834, 930, 37], [1138, 900, 930, 52], [1139, 963, 932, 47], [1140, 1018, 928, 47], [1474, 92, 957, 21], [1475, 210, 958, 19], [1476, 334, 963, 26], [1477, 450, 962, 21], [1478, 568, 963, 22], [1479, 688, 960, 21], [1480, 807, 965, 28], [1481, 923, 962, 26], [1482, 1051, 958, 22], [1107, 63, 985, 38], [1108, 122, 988, 47], [1109, 184, 992, 40], [1110, 244, 990, 46], [1111, 302, 988, 39], [1112, 362, 992, 45], [1113, 420, 990, 35], [1114, 480, 996, 44], [1115, 540, 990, 46], [1116, 597, 992, 50], [1117, 656, 992, 41], [1118, 719, 990, 34], [1119, 776, 992, 50], [1120, 838, 988, 47], [1121, 896, 991, 41], [1122, 956, 984, 41], [1123, 1018, 986, 40], [1465, 30, 1020, 26], [1466, 152, 1016, 19], [1467, 271, 1017, 22], [1468, 391, 1023, 22], [1469, 512, 1020, 27], [1470, 628, 1021, 22], [1471, 744, 1022, 25], [1472, 862, 1020, 25], [1473, 985, 1019, 22], [1090, 62, 1050, 37], [1091, 123, 1048, 39], [1092, 184, 1048, 50], [1093, 243, 1048, 38], [1094, 302, 1046, 41], [1095, 362, 1046, 41], [1096, 420, 1046, 46], [1097, 480, 1048, 47], [1098, 538, 1047, 48], [1099, 598, 1048, 44], [1100, 658, 1046, 43], [1101, 718, 1048, 42], [1102, 776, 1047, 44], [1103, 835, 1048, 32], [1104, 894, 1047, 49], [1105, 956, 1046, 39], [1106, 1012, 1047, 41], [1089, 62, 1110, 36], [1088, 122, 1108, 33], [1087, 182, 1109, 34], [1086, 246, 1108, 33], [1085, 302, 1108, 31], [1084, 360, 1110, 35], [1083, 421, 1108, 32], [1082, 481, 1108, 35], [1081, 538, 1113, 32], [1080, 600, 1110, 33], [1079, 660, 1107, 31], [1078, 720, 1110, 32], [1077, 779, 1108, 30], [1076, 840, 1110, 33], [1075, 898, 1108, 35], [1074, 958, 1108, 32], [1073, 1012, 1110, 33], [1464, 28, 1140, 24], [1463, 92, 1139, 26], [1462, 150, 1140, 25], [1461, 210, 1140, 25], [1460, 269, 1138, 24], [1459, 329, 1140, 22], [1458, 389, 1140, 24], [1457, 448, 1139, 23], [1456, 508, 1140, 22], [1455, 566, 1141, 23], [1454, 628, 1140, 24], [1453, 688, 1142, 25], [1452, 748, 1142, 23], [1451, 809, 1141, 24], [1450, 869, 1142, 25], [1449, 930, 1142, 25], [1448, 984, 1143, 26], [1447, 1046, 1142, 23]]

	const canvasRef = React.useRef(null);
	const kilterboard = React.useRef(null);
	const [model, setModel] = useState(null);
	const [route, setRoute] = useState({'placements':null, 'gradeIndex': null, 'gradeLabel': ['na','na'], 'angle': null});

	const [grader, setGrader] = useState(null);
	const [searchRoute, setSearchRoute] = useState(null);
	const [angleGrader, setAngleGrader] = useState(null);
	const [angleGAN, setAngleGAN] = useState(null);
	const [grade, setGrade] = useState(['na','na']);
	const [loading, setLoading] = useState(false);

	const loadModel = async() => {
		const loadedModel = await tf.loadLayersModel('https://boardbot.s3.us-east-2.amazonaws.com/BoardBot/model.json');
		setModel(loadedModel);

		const loadedGrader = await tf.loadLayersModel('https://boardbotclassifier.s3.us-east-2.amazonaws.com/model.json');
		setGrader(loadedGrader)
	}

	useEffect(()=>{
		loadModel();
		const renderCtx = canvasRef.current.getContext('2d');
		const img = new Image()
		img.src = "kilterboard.png"
		img.onload = () => {
			renderCtx.canvas.width =  img.naturalWidth;
			renderCtx.canvas.height = img.naturalHeight;
			renderCtx.drawImage(img, 0, 0)
		}
	},[])

	const generateRoute = async(e) => {
		if(angleGAN === null || angleGAN === '')
		{
			toast.warn("You must give an angle to generate a route");
		}
		else if(!Number.isInteger(parseInt(angleGAN)))
		{
			toast.warn("Only integer values accepted for angles");
		}
                else if(angleGAN < 0)
                {
                        toast.warn("Angle must be greater than or equal to 0");
                }
                else if(angleGAN > 70)
                {
                        toast.warn("Angle must be less than or equal to 70");
                }
                else if(angleGAN % 5 != 0)
                {
                        toast.warn("Angle must be evenly divisible by 5");
                }
		else if(model != null)
		{
			var visualdisplay = []

			let isRouteValid = false;

			while(!isRouteValid)
			{
				let input = tf.randomNormal([1, 100]);
				let route = await model.predict(input);
				var result = route.arraySync()[0];

				isRouteValid = true;

				var visualdisplay = normToVis(result, idmap);

				var holdTypesCount = {"mid":0,"feet":0,"start":0,"finish":0}

				visualdisplay.forEach(function (placement, index) {
					holdTypesCount[placement[1]]++
				});

				if (holdTypesCount["start"] === 0 || holdTypesCount["start"] > 2)
				{
					isRouteValid = false;
				}
				else if (holdTypesCount["finish"] === 0 || holdTypesCount["finish"] > 2)
				{
					isRouteValid = false;
				}
				else if (holdTypesCount["finish"] + holdTypesCount["finish"] + holdTypesCount["finish"] + holdTypesCount["finish"] > 35)
				{
					isRouteValid = false;
				}
				else
				{
					isRouteValid = true;
				}
			}

			const ctx = canvasRef.current.getContext('2d');

			const img = new Image()
			img.src = "kilterboard.png"

			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

			img.onload = function() {
				ctx.drawImage(img, 0, 0);
			}

			visualdisplay.forEach(function (placement, index) {
				vismap.forEach(function (axis, index) {
					if(placement[0] === axis[0]){
						ctx.beginPath();

						var color = ''

						if(placement[1] === "finish"){
							color = '#f003fc';
						} else if (placement[1] === "start"){
							color = '#03fc5e';
						} else if (placement[1] === "mid"){
							color = '#03d3fc';
						} else{
							color = '#fca103';
						}

						var gradient = ctx.createRadialGradient(axis[1], axis[2], axis[3]/3, axis[1], axis[2], axis[3]/1.5);
						gradient.addColorStop(0, color);
						gradient.addColorStop(1, 'white');

						ctx.arc(axis[1], axis[2], axis[3]/1.5, 0, 2 * Math.PI);
						ctx.fillStyle = gradient;
						ctx.fill();
					}
				});
			});

			var placements = await visToPlacements(visualdisplay);

			var routeGrade = gradeNorm(grader, result, angleGAN)
			await setRoute({'placements':placements, 'gradeIndex': routeGrade['gradeIndex'], 'gradeLabel': routeGrade['gradeLabel'], 'angle': angleGAN});
		}
	}

	const gradeClimb = async(e) => {
		if(!Number.isInteger(parseInt(angleGrader)))
		{
			toast.warn("Only integer values accepted for angles");
		}
		else if(searchRoute != null && angleGrader != null)
		{
			setLoading(true)

			const name = {"name":searchRoute};
			const res = await fetch('/gradeClimb', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(name)
			});

			const body = await res.json();

			var holds = placementsToNorm(body, idmap)

			var grade = gradeNorm(grader, holds, angleGrader);
			setLoading(false);
			setGrade(grade["gradeLabel"])
		}
	}

	const exportRoute = async(e) => {
		if(model != null && route['placements'] != null)
		{
			const res = await fetch('/export', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({'placements': route['placements'], 'gradeIndex': route['gradeIndex'], 'gradeLabel': route['gradeLabel'][0] + '/' + route['gradeLabel'][1], 'angle': route['angle']}),
			});
			const body = await res.json();
			let string = "Route exported, find it on the KilterBoard app by searching for " + body["Success"]
			toast.success(string);
		}
	}

	function handleNameChange(e) {
		setSearchRoute(e.target.value);
	}

	function handleAngleGraderChange(e) {
		setAngleGrader(e.target.value);
	}

	function handleAngleGANChange(e) {
		setAngleGAN(e.target.value);
	}

	return(
	<div class = "Container">
		<ToastContainer position="top-right" autoClose={10000} closeOnClick={false} draggable={false} pauseOnHover/>
		<div class="d-flex flex-column min-vh-100 justify-content-center align-items-center">
			<div class="row row-cols-1 row-cols-md-2 g-4">
				<div class="col">
					<div class="card my-auto mx-auto">
						<canvas class="card-img-top" id="canvas" ref={canvasRef}></canvas>
						<div class="card-body text-center">
							{model == null ?
								<div>
									<div>Model Loading</div>
									<Loader type="Puff" color="#00BFFF" height={100} width={100}/>
								</div>
							:
							<React.Fragment>
								<div class="input-group mb-3">
									<input type="text" class="form-control" placeholder="Angle (in degrees)" onChange={handleAngleGANChange}/>
									<span class="input-group-text" id="basic-addon1">{route['gradeLabel'][1]}/{route['gradeLabel'][0]}</span>
								</div>
								<div class="input-group mb-3">
									<button type="button" class="btn btn-success" onClick={generateRoute}>Generate Route</button>
									<button type="button" class="btn btn-warning" onClick={exportRoute}>Send Route to App</button>
								</div>
							</React.Fragment>
							}
						</div>
					</div>
				</div>
				<div class="col">
					<div class="card">
						<div class="card-body">
							<h3 class="card-title">
								<a class="navbar-brand">
									<img src="BoardGANlogo.svg" width="70" height="70" alt=""></img>
								</a>
							BoardGAN</h3>
							<p class="card-text">BoardGAN is a deep convolutional generative adversarial network that generates routes on climbing training boards. Generated routes are automatically pushed to their corresponding IOS/Android apps for climbers to use for training. It currently supports and is trained on the 12x12 kilterboard. Upcoming features include a conditional model that supports difficulty and climbing angle adjustment, word embedding into latent space for descriptive natural language processed routes, and support for different board configurations and brands.</p>
						</div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">
                <iframe src="https://www.youtube.com/embed/nk6U0c3YM9g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </li>
            </ul>
					</div>
				</div>
        <div class="col">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title">AutoGrader</h5>
            </div>
            <div class="card-body">
              {grader == null ?
                <div>
                  <div>Model Loading</div>
                  <Loader type="Puff" color="#00BFFF" height={100} width={100}/>
                </div>
              :
              <React.Fragment>
                <div class="input-group mb-3">
                  <input type="text" class="form-control" placeholder="Name of the route (Input exactly as show on KilterBoard app)" onChange={handleNameChange}/>
                  <div class="input-group-append">
                    <span class="input-group-text" id="basic-addon1">@</span>
                  </div>
                    <input type="text" class="form-control" placeholder="Angle (in degrees)" onChange={handleAngleGraderChange}/>
                  <div class="input-group-append">
                    <button type="button" class="btn btn-warning" disabled={loading} onClick={gradeClimb}>Grade Climb</button>
                  </div>
                </div>
              </React.Fragment>
              }
              <h1><span class="badge bg-primary">
                Grade: {loading ?
                  <span class="badge placeholder-glow"><span class="placeholder col-6"></span></span>
                  :
                  <span class="badge bg-secondary">{grade[1]}/{grade[0]}</span>
                }
              </span></h1>
            </div>
          </div>
        </div>
			</div>
		</div>
	</div>
	);
}
export default App
