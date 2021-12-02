const gff3 = `# Note: See http://song.sourceforge.net
# multi-exon gene - several linked CDSs
# single exon gene - one CDS only
##gff-version 3
ctgA	example	contig	1	50001	.	.	.	Name=ctgA;multivalue=val1,val2,val3
ctgA	example	BAC	1000	20000	.	.	.	ID=b101.2;Name=b101.2;Note=Fingerprinted BAC with end reads
ctgA	example	SNP	1000	1000	0.987	.	.	ID=FakeSNP1;Name=FakeSNP;Note=This is a fake SNP that should appear at 1000 with length 1
ctgA	example	clone_start	1000	1500	.	+	.	Parent=b101.2
ctgA	example	remark	1000	2000	.	.	.	Name=Remark:hga;Alias=hga
ctgA	est	EST_match	1050	3202	.	+	.	ID=Match1;Name=agt830.5;Target=agt830.5 1 654
ctgA	est	EST_match	1050	7300	.	+	.	ID=Match3;Name=agt221.5;Target=agt221.5 1 1253
ctgA	est	match_part	1050	1500	.	+	.	Parent=Match1;Name=agt830.5;Target=agt830.5 1 451
ctgA	est	match_part	1050	1500	.	+	.	Parent=Match3;Name=agt221.5;Target=agt221.5 1 451
ctgA	example	gene	1050	9000	.	+	.	ID=EDEN;Name=EDEN;Note=protein kinase
ctgA	example	mRNA	1050	9000	.	+	.	ID=EDEN.1;Parent=EDEN;Name=EDEN.1;Note=Eden splice form 1;Index=1
ctgA	example	mRNA	1050	9000	.	+	.	ID=EDEN.2;Parent=EDEN;Name=EDEN.2;Note=Eden splice form 2;Index=1
ctgA	example	five_prime_UTR	1050	1200	.	+	.	Parent=EDEN.1
ctgA	example	five_prime_UTR	1050	1200	.	+	.	Parent=EDEN.2
ctgA	example	protein_coding_primary_transcript	1100	2000	.	+	.	Name=Gene:hga;Alias=hga
ctgA	est	EST_match	1150	7200	.	+	.	ID=Match5;Name=agt767.5;Target=agt767.5 1 1153
ctgA	est	match_part	1150	1500	.	+	.	Parent=Match5;Name=agt767.5;Target=agt767.5 1 351
ctgA	example	polypeptide	1200	1900	.	+	.	Name=Protein:HGA;Alias=hga
ctgA	example	CDS	1201	1500	.	+	0	Parent=EDEN.1
ctgA	example	CDS	1201	1500	.	+	0	Parent=EDEN.2
ctgA	example	mRNA	1300	9000	.	+	.	ID=EDEN.3;Parent=EDEN;Name=EDEN.3;Note=Eden splice form 3;Index=1
ctgA	example	five_prime_UTR	1300	1500	.	+	.	Parent=EDEN.3
ctgA	example	protein_coding_primary_transcript	1600	3000	.	-	.	Name=Gene:hgb;Alias=hgb
ctgA	example	remark	1659	1984	.	+	.	Name=f07;Note=This is an example
ctgA	example	polypeptide	1800	2900	.	-	.	Name=Protein:HGB;Alias=hgb
ctgA	est	match_part	3000	3202	.	+	.	Parent=Match1;Name=agt830.5;Target=agt830.5 452 654
ctgA	example	CDS	3000	3902	.	+	0	Parent=EDEN.1
ctgA	example	five_prime_UTR	3000	3300	.	+	.	Parent=EDEN.3
ctgA	example	remark	3014	6130	.	+	.	Name=f06;Note=This is another example
ctgA	example	CDS	3301	3902	.	+	0	Parent=EDEN.3
ctgA	example	remark	4715	5968	.	-	.	Name=f05;Note=Ok! Ok! I get the message.
ctgA	est	match_part	5000	5500	.	+	.	Parent=Match3;Name=agt221.5;Target=agt221.5 452 952
ctgA	est	match_part	5000	5500	.	+	.	Parent=Match5;Name=agt767.5;Target=agt767.5 352 852
ctgA	example	CDS	5000	5500	.	+	0	Parent=EDEN.1
ctgA	example	CDS	5000	5500	.	+	0	Parent=EDEN.2
ctgA	example	CDS	5000	5500	.	+	1	Parent=EDEN.3
ctgA	example	match	5233	5302	.	-	.	Name=seg04
ctgA	est	EST_match	5410	7503	.	-	.	ID=Match2;Name=agt830.3;Target=agt830.3 1 595
ctgA	est	match_part	5410	5500	.	-	.	Parent=Match2;Name=agt830.3;Target=agt830.3 505 595
ctgA	example	match	5800	6101	.	-	.	Name=seg04
ctgA	example	match	6442	6854	.	-	.	Name=seg04
ctgA	example	match	6885	7241	.	-	.	Name=seg03
ctgA	est	match_part	7000	7200	.	+	.	Parent=Match5;Name=agt767.5;Target=agt767.5 853 1153
ctgA	est	match_part	7000	7300	.	+	.	Parent=Match3;Name=agt221.5;Target=agt221.5 953 1253
ctgA	est	match_part	7000	7503	.	-	.	Parent=Match2;Name=agt830.3;Target=agt830.3 1 504
ctgA	example	CDS	7000	7600	.	+	1	Parent=EDEN.3
ctgA	example	CDS	7000	7608	.	+	0	Parent=EDEN.1
ctgA	example	CDS	7000	7608	.	+	0	Parent=EDEN.2
ctgA	example	match	7106	7211	.	-	.	Name=seg04
ctgA	example	match	7410	7737	.	-	.	Name=seg03
ctgA	est	EST_match	7500	8000	.	-	.	ID=Match4;Name=agt221.3;Target=agt221.3 1 501
ctgA	example	three_prime_UTR	7601	9000	.	+	.	Parent=EDEN.3
ctgA	example	three_prime_UTR	7609	9000	.	+	.	Parent=EDEN.1
ctgA	example	three_prime_UTR	7609	9000	.	+	.	Parent=EDEN.2
ctgA	example	match	7695	8177	.	-	.	Name=seg04
ctgA	est	EST_match	8000	9000	.	-	.	ID=Match6;Name=agt767.3;Target=agt767.3 1 1001
ctgA	example	match	8055	8080	.	-	.	Name=seg03
ctgA	example	match	8306	8999	.	-	.	Name=seg03
ctgA	example	match	8545	8783	.	-	.	Name=seg04
ctgA	example	match	8869	8935	.	-	.	Name=seg04
ctgA	example	match	9404	9825	.	-	.	Name=seg04
ctgA	bare_predicted	CDS	10000	11500	.	+	0	Name=Apple1;Note=CDS with no parent
ctgA	example	polypeptide_domain	11911	15561	.	+	.	Name=m11;Note=kinase
ctgA	example	match	12531	12895	.	+	.	Name=seg12
ctgA	predicted	mRNA	13000	17200	.	+	0	ID=cds-Apple2;Name=Apple2;Note=mRNA with CDSs but no UTRs
ctgA	example	match	13122	13449	.	+	.	Name=seg12
ctgA	example	remark	13280	16394	.	+	.	Name=f08
ctgA	example	match	13452	13745	.	+	.	Name=seg12
ctgA	predicted	CDS	13500	13800	.	+	0	Parent=cds-Apple2
ctgA	example	polypeptide_domain	13801	14007	.	-	.	Name=m05;Note=helix loop helix
ctgA	example	match	13908	13965	.	+	.	Name=seg12
ctgA	example	match	13998	14488	.	+	.	Name=seg12
ctgA	example	match	14564	14899	.	+	.	Name=seg12
ctgA	example	polypeptide_domain	14731	17239	.	-	.	Name=m14;Note=kinase
ctgA	predicted	CDS	15000	15500	.	+	1	Parent=cds-Apple2
ctgA	example	match	15185	15276	.	+	.	Name=seg12
ctgA	example	remark	15329	15533	.	+	.	Name=f10
ctgA	example	polypeptide_domain	15396	16159	.	+	.	Name=m03;Note=zinc finger
ctgA	example	match	15639	15736	.	+	.	Name=seg12
ctgA	example	match	15745	15870	.	+	.	Name=seg12
ctgA	predicted	CDS	16500	17000	.	+	2	Parent=cds-Apple2
ctgA	example	polypeptide_domain	17023	17675	.	+	.	Name=m08;Note=7-transmembrane
ctgA	exonerate	mRNA	17400	23000	.	+	.	ID=rna-Apple3;Name=Apple3;Note=mRNA with both CDSs and UTRs
ctgA	exonerate	UTR	17400	17999	.	+	.	Parent=rna-Apple3
ctgA	example	polypeptide_domain	17667	17690	.	+	.	Name=m13;Note=DEAD box
ctgA	exonerate	CDS	18000	18800	.	+	0	Parent=rna-Apple3
ctgA	example	polypeptide_domain	18048	18552	.	-	.	Name=m07;Note=7-transmembrane
ctgA	example	match	18509	18985	.	+	.	Name=seg08
ctgA	example	match	18989	19388	.	+	.	Name=seg08
ctgA	exonerate	CDS	19000	19500	.	+	1	Parent=rna-Apple3
ctgA	example	remark	19157	22915	.	-	.	Name=f13
ctgA	example	match	19249	19559	.	+	.	Name=seg06
ctgA	example	match	19496	19962	.	+	.	Name=seg08
ctgA	example	clone_end	19500	20000	.	-	.	Parent=b101.2
ctgA	example	match	19975	20260	.	+	.	Name=seg06
ctgA	example	match	20093	20580	.	+	.	Name=seg08
ctgA	example	match	20379	20491	.	+	.	Name=seg06
ctgA	example	match	20533	21005	.	+	.	Name=seg06
ctgA	example	match	20970	21052	.	+	.	Name=seg08
ctgA	exonerate	CDS	21000	21200	.	+	2	Parent=rna-Apple3
ctgA	example	match	21122	21331	.	+	.	Name=seg06
ctgA	exonerate	UTR	21201	23000	.	+	.	Parent=rna-Apple3
ctgA	example	match	21270	21277	.	+	.	Name=seg08
ctgA	example	match	21682	22176	.	+	.	Name=seg06
ctgA	example	match	21685	22168	.	+	.	Name=seg08
ctgA	example	polypeptide_domain	21748	25612	.	+	.	Name=m12;Note=kinase
ctgA	example	remark	22132	24633	.	+	.	Name=f15
ctgA	example	match	22374	22570	.	+	.	Name=seg06
ctgA	example	match	22564	22869	.	+	.	Name=seg08
ctgA	example	match	22958	23298	.	+	.	Name=seg08
ctgA	example	match	23025	23427	.	+	.	Name=seg06
ctgA	example	remark	23072	23185	.	+	.	Name=f14
ctgA	example	match	23412	23469	.	+	.	Name=seg08
ctgA	example	match	23932	23932	.	+	.	Name=seg08
ctgA	example	match	24228	24510	.	+	.	Name=seg11
ctgA	example	match	24328	24787	.	+	.	Name=seg08
ctgA	example	remark	24562	28338	.	+	.	Name=f02
ctgA	example	match	24868	25012	.	+	.	Name=seg11
ctgA	example	match	25212	25426	.	+	.	Name=seg11
ctgA	example	match	25228	25367	.	+	.	Name=seg08
ctgA	example	match	25794	25874	.	+	.	Name=seg11
ctgA	example	match	26075	26519	.	+	.	Name=seg11
ctgA	example	match	26122	26126	.	+	.	Name=seg02
ctgA	example	match	26497	26869	.	+	.	Name=seg02
ctgA	example	match	26503	26799	.	-	.	Name=seg05
ctgA	example	match	26930	26940	.	+	.	Name=seg11
ctgA	example	match	26975	27063	.	+	.	Name=seg11
ctgA	example	match	27172	27185	.	-	.	Name=seg05
ctgA	example	match	27201	27325	.	+	.	Name=seg02
ctgA	example	match	27372	27433	.	+	.	Name=seg02
ctgA	example	match	27415	27799	.	+	.	Name=seg11
ctgA	example	match	27448	27860	.	-	.	Name=seg05
ctgA	example	match	27565	27565	.	+	.	Name=seg02
ctgA	example	match	27813	28091	.	+	.	Name=seg02
ctgA	example	match	27880	27943	.	+	.	Name=seg11
ctgA	example	match	27887	28076	.	-	.	Name=seg05
ctgA	example	match	28093	28201	.	+	.	Name=seg02
ctgA	example	match	28225	28316	.	-	.	Name=seg05
ctgA	example	match	28225	28346	.	+	.	Name=seg11
ctgA	example	match	28329	28377	.	+	.	Name=seg02
ctgA	example	polypeptide_domain	28332	30033	.	-	.	Name=m02;Note=HOX
ctgA	example	polypeptide_domain	28342	28447	.	-	.	Name=m10;Note=DEAD box
ctgA	example	match	28375	28570	.	+	.	Name=seg11
ctgA	example	match	28758	29041	.	+	.	Name=seg11
ctgA	example	match	28777	29058	.	-	.	Name=seg05
ctgA	example	match	28829	29194	.	+	.	Name=seg02
ctgA	example	match	29101	29302	.	+	.	Name=seg11
ctgA	example	match	29513	29647	.	-	.	Name=seg05
ctgA	example	match	29517	29702	.	+	.	Name=seg02
ctgA	example	match	29604	29702	.	+	.	Name=seg11
ctgA	example	match	29713	30061	.	+	.	Name=seg02
ctgA	example	match	29771	29942	.	+	.	Name=seg10
ctgA	example	match	29867	29885	.	+	.	Name=seg11
ctgA	example	match	30042	30340	.	+	.	Name=seg10
ctgA	example	match	30108	30216	.	-	.	Name=seg05
ctgA	example	match	30241	30246	.	+	.	Name=seg11
ctgA	example	match	30329	30774	.	+	.	Name=seg02
ctgA	example	match	30465	30798	.	-	.	Name=seg05
ctgA	example	match	30575	30738	.	+	.	Name=seg11
ctgA	example	polypeptide_domain	30578	31748	.	+	.	Name=m06;Note=SUSHI repeat
ctgA	example	match	30808	31306	.	+	.	Name=seg02
ctgA	example	match	30810	31307	.	+	.	Name=seg10
ctgA	example	match	31232	31236	.	-	.	Name=seg05
ctgA	example	match	31421	31817	.	-	.	Name=seg05
ctgA	example	match	31516	31729	.	+	.	Name=seg02
ctgA	example	match	31753	32154	.	+	.	Name=seg02
ctgA	example	match	31761	31984	.	+	.	Name=seg10
ctgA	example	match	32010	32057	.	-	.	Name=seg05
ctgA	example	match	32208	32680	.	-	.	Name=seg05
ctgA	example	match	32329	32359	.	+	.	Name=seg01
ctgA	example	match	32374	32937	.	+	.	Name=seg10
ctgA	example	match	32595	32696	.	+	.	Name=seg02
ctgA	example	match	32892	32901	.	+	.	Name=seg02
ctgA	example	match	33053	33325	.	-	.	Name=seg05
ctgA	example	match	33127	33388	.	+	.	Name=seg02
ctgA	example	polypeptide_domain	33325	35791	.	+	.	Name=m04;Note=Ig-like
ctgA	example	match	33438	33868	.	-	.	Name=seg05
ctgA	example	match	33439	33443	.	+	.	Name=seg02
ctgA	example	match	33759	34209	.	+	.	Name=seg02
ctgA	example	match	34244	34313	.	-	.	Name=seg05
ctgA	example	match	34401	34466	.	+	.	Name=seg02
ctgA	example	match	34605	34983	.	-	.	Name=seg05
ctgA	example	match	35333	35507	.	-	.	Name=seg05
ctgA	example	match	35642	35904	.	-	.	Name=seg05
ctgA	example	remark	36034	38167	.	+	.	Name=f09
ctgA	example	match	36616	37057	.	-	.	Name=seg09
ctgA	example	remark	36649	40440	.	-	.	Name=f03
ctgA	example	match	37208	37227	.	-	.	Name=seg09
ctgA	example	remark	37242	38653	.	+	.	Name=f04
ctgA	example	polypeptide_domain	37497	40559	.	-	.	Name=m15;Note=7-transmembrane
ctgA	example	match	39265	39361	.	-	.	Name=seg15
ctgA	example	match	39753	40034	.	-	.	Name=seg15
ctgA	example	match	40515	40954	.	-	.	Name=seg15
ctgA	example	match	41137	41318	.	-	.	Name=seg14
ctgA	example	match	41252	41365	.	-	.	Name=seg15
ctgA	example	match	41492	41504	.	-	.	Name=seg15
ctgA	example	match	41754	41948	.	-	.	Name=seg14
ctgA	example	match	41941	42377	.	-	.	Name=seg15
ctgA	example	match	42057	42474	.	-	.	Name=seg14
ctgA	example	match	42748	42954	.	-	.	Name=seg15
ctgA	example	match	42890	43270	.	-	.	Name=seg14
ctgA	example	match	43395	43811	.	-	.	Name=seg14
ctgA	example	match	43401	43897	.	-	.	Name=seg15
ctgA	example	match	44043	44113	.	-	.	Name=seg15
ctgA	example	match	44065	44556	.	-	.	Name=seg14
ctgA	example	match	44191	44514	.	-	.	Name=seg07
ctgA	example	match	44399	44888	.	-	.	Name=seg15
ctgA	example	match	44552	45043	.	-	.	Name=seg07
ctgA	example	remark	44705	47713	.	-	.	Name=f01
ctgA	example	match	44763	45030	.	-	.	Name=seg14
ctgA	example	match	45231	45488	.	-	.	Name=seg14
ctgA	example	match	45281	45375	.	-	.	Name=seg15
ctgA	example	match	45373	45600	.	-	.	Name=seg07
ctgA	example	match	45711	46041	.	-	.	Name=seg15
ctgA	example	match	45790	46022	.	-	.	Name=seg14
ctgA	example	match	45897	46315	.	-	.	Name=seg07
ctgA	example	polypeptide_domain	46012	48851	.	+	.	Name=m09;Note=kinase
ctgA	example	match	46092	46318	.	-	.	Name=seg14
ctgA	example	match	46425	46564	.	-	.	Name=seg15
ctgA	example	match	46491	46890	.	-	.	Name=seg07
ctgA	example	match	46738	47087	.	-	.	Name=seg15
ctgA	example	match	46816	46992	.	-	.	Name=seg14
ctgA	example	remark	46990	48410	.	-	.	Name=f11
ctgA	example	match	47126	47297	.	-	.	Name=seg07
ctgA	example	match	47329	47595	.	-	.	Name=seg15
ctgA	example	match	47449	47829	.	-	.	Name=seg14
ctgA	example	match	47735	47983	.	-	.	Name=seg07
ctgA	example	match	47858	47979	.	-	.	Name=seg15
ctgA	example	match	48169	48453	.	-	.	Name=seg15
ctgA	example	polypeptide_domain	48253	48366	.	+	.	Name=m01;Note=WD40
ctgA	example	match	48447	48709	.	-	.	Name=seg07
ctgA	example	match	48931	49186	.	-	.	Name=seg07
ctgA	example	match	49406	49476	.	+	.	Name=seg13
ctgA	example	match	49472	49699	.	-	.	Name=seg07
ctgA	example	remark	49758	50000	.	-	.	Name=f12
ctgA	example	match	49762	50000	.	+	.	Name=seg13
ctgA	example	match	49957	50000	.	-	.	Name=seg07
ctgA	example	match	49957	50000	.	-	.	Name=seg07
ctgB	example	contig	1	6079	.	.	.	Name=ctgB
ctgB	example	remark	1659	1984	.	+	.	Name=f07;Note=This is an example
ctgB	example	remark	3014	6130	.	+	.	Name=f06;Note=This is another example
ctgB	example	remark	4715	5968	.	-	.	Name=f05;Note=ああ、この機能は、世界中を旅しています！
`

export default gff3
