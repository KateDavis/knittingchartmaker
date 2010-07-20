<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:k="http://www.knitml.com/schema/pattern">
	<xsl:output type="xml" indent="yes"/>
	
	<xsl:param name="sz">20</xsl:param>
	<xsl:param name="grid">1</xsl:param>
	<xsl:param name="gridcol">#111111</xsl:param>
	<xsl:param name="numbers">1</xsl:param>
	<xsl:param name="numberscol">#000000</xsl:param>
	
	<xsl:variable name="numberscolw">40</xsl:variable>
	<xsl:variable name="numberscolh">40</xsl:variable>
	
	<xsl:variable name="gwc" select="sum(//k:row[position()=1]/k:*)"/>
	<xsl:variable name="ghc" select="count(//k:row)"/>
	
	<xsl:variable name="gw" select="$gwc*$sz"/>
	<xsl:variable name="gh" select="$ghc*$sz"/>
	
	<xsl:variable name="w">
		<xsl:choose>
			<xsl:when test="$numbers = 1 or $numbers = 3">
				<xsl:value-of select="$gw + $numberscolw"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$gw"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="h">
		<xsl:choose>
			<xsl:when test="$numbers = 2 or $numbers = 3">
				<xsl:value-of select="$gh + $numberscolh"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$gh"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

	<xsl:template match="/">
		<xsl:apply-templates select="k:pattern"/>
	</xsl:template>
	
	<xsl:template match="k:pattern">
		<svg width="{$w}" height="{$h}">
			<rect x="0" y="0" width="{$w}" height="{$h}" fill="#FFFFFF"/>
			<xsl:for-each select="//k:row">
				<xsl:variable name="y" select="(position() - 1)*$sz"/>
				<xsl:if test="$numbers = 1 or $numbers = 3">
					<!-- position fudged to get close to center alignment -->
					<text x="{$gw + ($numberscolw div 2)}" y="{$y + 8 * ($sz div 11)}" fill="{$numberscol}" font-size="{$sz div 2}" text-anchor="middle">
						<xsl:value-of select="$ghc - (position() - 1)"/>
					</text>
				</xsl:if>
				<xsl:for-each select="k:*">
					<xsl:variable name="x" select="$sz*(position() - 1)"/>
					<xsl:variable name="ref" select="@yarn-ref"/>
					<xsl:variable name="col" select="//k:yarn[@id = $ref]/k:color/@name"/>
					<!-- assumes only one repeat per stitch -->
					<g class="{local-name()}" transform="translate({$x},{$y})">
						<xsl:element name="rect">
							<xsl:attribute name="x">0</xsl:attribute>
							<xsl:attribute name="y">0</xsl:attribute>
							<xsl:attribute name="width"><xsl:value-of select="$sz"/></xsl:attribute>
							<xsl:attribute name="height"><xsl:value-of select="$sz"/></xsl:attribute>
							<xsl:attribute name="fill"><xsl:value-of select="$col"/></xsl:attribute>
							<xsl:if test="$grid">
								<xsl:attribute name="stroke"><xsl:value-of select="$gridcol"/></xsl:attribute>
								<xsl:attribute name="stroke-width">0.5</xsl:attribute>
							</xsl:if>
						</xsl:element>
						<xsl:call-template name="draw-stitch">
							<xsl:with-param name="st" select="local-name()"/>
						</xsl:call-template>
					</g>
				</xsl:for-each>
			</xsl:for-each>
			
			<xsl:if test="$grid">
				<rect x="0" y="0" width="{$gw}" height="{$gh}" fill="none" stroke="{$gridcol}" stroke-width="0.5"/>
			</xsl:if>
			
			<xsl:if test="$numbers = 2 or $numbers = 3">
				<xsl:for-each select="//k:row[1]/k:*">
					<xsl:variable name="x" select="$sz*(position() - 1)"/>
					<!-- position fudged to get close to center alignment -->
					<text x="{$x + ($sz div 2)}" y="{$gh + 8 * ($numberscolh div 11)}" fill="{$numberscol}" font-size="{$sz div 2}" text-anchor="middle">
						<xsl:value-of select="$gwc - (position() - 1)"/>
					</text>
				</xsl:for-each>
			</xsl:if>		
			
		</svg>
	</xsl:template>
	
	<xsl:template name="draw-stitch">
		<xsl:param name="st"/>
		<xsl:if test="$st">
			<xsl:choose>
				<xsl:when test="$st = 'purl'">
					<circle cx="{$sz div 2}" cy="{$sz div 2}" r="{$sz div 6}" fill="#000000"/>
				</xsl:when>
				<xsl:when test="$st = 'sk2p'">
					<path d="M10,10 L{$sz - 10},{$sz - 10} M{$sz div 2},{$sz - 10} L{$sz div 2},{$sz div 2} L10,{$sz - 10}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:when test="$st = 'k2tog'">
					<path d="M{$sz - 10},10 L10,{$sz - 10} M{$sz div 2},{$sz div 2} L{$sz - 10},{$sz - 10}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:when test="$st = 'k3tog'">
					<path d="M{$sz - 10},10 L10,{$sz - 10} M{$sz div 2},{$sz - 10} L{$sz div 2},{$sz div 2} {$sz - 10},{$sz - 10}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:when test="$st = 'slip'">
					<path d="M{$sz div 2},10 L{$sz div 2},{$sz - 10}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:when test="$st = 'yo'">
					<circle cx="{$sz div 2}" cy="{$sz div 2}" r="{$sz div 3}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:when test="$st = 'm1'">
					<path d="M10,{$sz - 10} L10,10 {$sz div 2},{$sz div 2} {$sz -10},10 {$sz -10},{$sz - 10}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:when test="$st = 'ssk'">
					<path d="M10,10 L{$sz -10},{$sz - 10} M{$sz div 2},{$sz div 2} L10,{$sz - 10}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:when test="$st = 'ck3dec'">
					<path d="M10,{$sz - 10} L{$sz div 2},10 {$sz - 10},{$sz - 10} M{$sz div 2},10 L{$sz div 2},{$sz - 10}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:when test="$st = 'k2tog_v2'">
					<path d="M{$sz - 10},10 L10,{$sz - 10}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:when test="$st = 'ssk_v2'">
					<path d="M10,10 L{$sz - 10},{$sz - 10}" fill="none" stroke="#000000" stroke-width="1"/>
				</xsl:when>
				<xsl:otherwise/>
			</xsl:choose>
		</xsl:if>
	</xsl:template>
	
	
	<xsl:template name="draw-numbers">
	</xsl:template>
	
	
	
</xsl:stylesheet>
