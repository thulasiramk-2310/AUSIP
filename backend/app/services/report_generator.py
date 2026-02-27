import csv
import io
from datetime import datetime
from typing import List, Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import logging

logger = logging.getLogger(__name__)


def generate_csv_dashboard_report(data: Dict[str, Any]) -> bytes:
    """Generate CSV report for dashboard analytics"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['Unicorn Market Intelligence Report - Dashboard Analytics'])
    writer.writerow(['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
    writer.writerow([])
    
    # KPI Data
    writer.writerow(['=== Key Performance Indicators ==='])
    writer.writerow(['Metric', 'Value', 'Trend', 'Change'])
    
    kpis = data.get('kpis', [])
    for kpi in kpis:
        writer.writerow([
            kpi.get('title', ''),
            kpi.get('value', ''),
            kpi.get('trend', ''),
            kpi.get('trendValue', '')
        ])
    
    writer.writerow([])
    
    # Industry Scores
    writer.writerow(['=== Industry RAUIS Scores ==='])
    writer.writerow(['Industry', 'Base Score', 'Risk', 'Saturation', 'Multiplier', 'Final RAUIS'])
    
    scores = data.get('industryScores', [])
    for score in scores:
        writer.writerow([
            score.get('industry', ''),
            score.get('baseScore', ''),
            score.get('risk', ''),
            score.get('saturation', ''),
            score.get('multiplier', ''),
            score.get('finalRAUIS', '')
        ])
    
    writer.writerow([])
    
    # Risk Analysis
    writer.writerow(['=== Risk Analysis ==='])
    writer.writerow(['Risk Factor', 'Level', 'Description'])
    
    risks = data.get('risks', [])
    for risk in risks:
        writer.writerow([
            risk.get('name', ''),
            risk.get('level', ''),
            risk.get('description', '')
        ])
    
    csv_bytes = output.getvalue().encode('utf-8')
    output.close()
    return csv_bytes


def generate_csv_alerts_report(alerts: List[Dict[str, Any]]) -> bytes:
    """Generate CSV report for system alerts"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['Unicorn Market Intelligence Report - System Alerts'])
    writer.writerow(['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
    writer.writerow([])
    
    # Alerts
    writer.writerow(['Alert Name', 'Status', 'Severity', 'Message', 'Timestamp', 'Source'])
    
    for alert in alerts:
        writer.writerow([
            alert.get('name', ''),
            alert.get('status', ''),
            alert.get('severity', ''),
            alert.get('message', ''),
            alert.get('timestamp', ''),
            alert.get('source', '')
        ])
    
    csv_bytes = output.getvalue().encode('utf-8')
    output.close()
    return csv_bytes


def generate_csv_combined_report(dashboard_data: Dict[str, Any], alerts: List[Dict[str, Any]]) -> bytes:
    """Generate combined CSV report"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(['Unicorn Market Intelligence Report - Combined Analytics'])
    writer.writerow(['Generated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')])
    writer.writerow([])
    
    # KPI Data
    writer.writerow(['=== Key Performance Indicators ==='])
    writer.writerow(['Metric', 'Value', 'Trend', 'Change'])
    
    kpis = dashboard_data.get('kpis', [])
    for kpi in kpis:
        writer.writerow([
            kpi.get('title', ''),
            kpi.get('value', ''),
            kpi.get('trend', ''),
            kpi.get('trendValue', '')
        ])
    
    writer.writerow([])
    
    # Industry Scores
    writer.writerow(['=== Industry RAUIS Scores ==='])
    writer.writerow(['Industry', 'Base Score', 'Risk', 'Saturation', 'Multiplier', 'Final RAUIS'])
    
    scores = dashboard_data.get('industryScores', [])
    for score in scores:
        writer.writerow([
            score.get('industry', ''),
            score.get('baseScore', ''),
            score.get('risk', ''),
            score.get('saturation', ''),
            score.get('multiplier', ''),
            score.get('finalRAUIS', '')
        ])
    
    writer.writerow([])
    
    # Alerts
    writer.writerow(['=== System Alerts ==='])
    writer.writerow(['Alert Name', 'Status', 'Severity', 'Message', 'Timestamp', 'Source'])
    
    for alert in alerts:
        writer.writerow([
            alert.get('name', ''),
            alert.get('status', ''),
            alert.get('severity', ''),
            alert.get('message', ''),
            alert.get('timestamp', ''),
            alert.get('source', '')
        ])
    
    writer.writerow([])
    
    # Risk Analysis
    writer.writerow(['=== Risk Analysis ==='])
    writer.writerow(['Risk Factor', 'Level', 'Description'])
    
    risks = dashboard_data.get('risks', [])
    for risk in risks:
        writer.writerow([
            risk.get('name', ''),
            risk.get('level', ''),
            risk.get('description', '')
        ])
    
    csv_bytes = output.getvalue().encode('utf-8')
    output.close()
    return csv_bytes


def generate_pdf_dashboard_report(data: Dict[str, Any]) -> bytes:
    """Generate PDF report for dashboard analytics"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Title
    story.append(Paragraph('Unicorn Market Intelligence Report', title_style))
    story.append(Paragraph('Dashboard Analytics', styles['Heading2']))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Spacer(1, 0.3 * inch))
    
    # KPI Section
    story.append(Paragraph('Key Performance Indicators', heading_style))
    
    kpis = data.get('kpis', [])
    if kpis:
        kpi_data = [['Metric', 'Value', 'Trend', 'Change']]
        for kpi in kpis:
            kpi_data.append([
                kpi.get('title', ''),
                str(kpi.get('value', '')),
                kpi.get('trend', ''),
                kpi.get('trendValue', '')
            ])
        
        kpi_table = Table(kpi_data, colWidths=[2.5*inch, 1.5*inch, 1*inch, 1*inch])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3F4F6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB'))
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 0.3 * inch))
    
    # Industry Scores Section
    story.append(Paragraph('Industry RAUIS Scores', heading_style))
    
    scores = data.get('industryScores', [])
    if scores:
        score_data = [['Industry', 'Base Score', 'Risk', 'Saturation', 'Multiplier', 'Final RAUIS']]
        for score in scores[:10]:  # Limit to first 10 for PDF
            score_data.append([
                score.get('industry', ''),
                str(score.get('baseScore', '')),
                str(score.get('risk', '')),
                str(score.get('saturation', '')),
                str(score.get('multiplier', '')),
                str(score.get('finalRAUIS', ''))
            ])
        
        score_table = Table(score_data, colWidths=[2*inch, 0.9*inch, 0.7*inch, 0.9*inch, 0.9*inch, 1*inch])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3F4F6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB'))
        ]))
        story.append(score_table)
        story.append(Spacer(1, 0.3 * inch))
    
    # Risk Analysis Section
    story.append(Paragraph('Risk Analysis', heading_style))
    
    risks = data.get('risks', [])
    if risks:
        risk_data = [['Risk Factor', 'Level', 'Description']]
        for risk in risks:
            risk_data.append([
                risk.get('name', ''),
                risk.get('level', '').upper(),
                risk.get('description', '')
            ])
        
        risk_table = Table(risk_data, colWidths=[2*inch, 1*inch, 3.5*inch])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3F4F6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB'))
        ]))
        story.append(risk_table)
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


def generate_pdf_alerts_report(alerts: List[Dict[str, Any]]) -> bytes:
    """Generate PDF report for system alerts"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    # Title
    story.append(Paragraph('Unicorn Market Intelligence Report', title_style))
    story.append(Paragraph('System Alerts', styles['Heading2']))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Spacer(1, 0.3 * inch))
    
    # Alerts Table
    alert_data = [['Alert Name', 'Status', 'Severity', 'Timestamp']]
    for alert in alerts:
        alert_data.append([
            alert.get('name', ''),
            alert.get('status', ''),
            alert.get('severity', ''),
            alert.get('timestamp', '')
        ])
    
    alert_table = Table(alert_data, colWidths=[2.5*inch, 1.2*inch, 1.2*inch, 1.6*inch])
    alert_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F59E0B')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3F4F6')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB'))
    ]))
    story.append(alert_table)
    
    # Alert Details
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph('Alert Details', styles['Heading2']))
    
    for alert in alerts:
        story.append(Paragraph(f"<b>{alert.get('name', '')}</b>", styles['Normal']))
        story.append(Paragraph(f"Message: {alert.get('message', '')}", styles['Normal']))
        story.append(Paragraph(f"Source: {alert.get('source', '')}", styles['Normal']))
        story.append(Spacer(1, 0.2 * inch))
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes


def generate_pdf_combined_report(dashboard_data: Dict[str, Any], alerts: List[Dict[str, Any]]) -> bytes:
    """Generate combined PDF report"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#374151'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Title
    story.append(Paragraph('Unicorn Market Intelligence Report', title_style))
    story.append(Paragraph('Combined Analytics & Alerts', styles['Heading2']))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
    story.append(Spacer(1, 0.3 * inch))
    
    # Dashboard section (same as dashboard report)
    story.append(Paragraph('Dashboard Analytics', heading_style))
    
    # KPIs
    kpis = dashboard_data.get('kpis', [])
    if kpis:
        kpi_data = [['Metric', 'Value', 'Trend', 'Change']]
        for kpi in kpis:
            kpi_data.append([
                kpi.get('title', ''),
                str(kpi.get('value', '')),
                kpi.get('trend', ''),
                kpi.get('trendValue', '')
            ])
        
        kpi_table = Table(kpi_data, colWidths=[2.5*inch, 1.5*inch, 1*inch, 1*inch])
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3B82F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3F4F6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB'))
        ]))
        story.append(kpi_table)
        story.append(Spacer(1, 0.2 * inch))
    
    # Page break before alerts
    story.append(PageBreak())
    
    # Alerts section
    story.append(Paragraph('System Alerts', heading_style))
    
    if alerts:
        alert_data = [['Alert Name', 'Status', 'Severity', 'Timestamp']]
        for alert in alerts[:15]:  # Limit alerts
            alert_data.append([
                alert.get('name', ''),
                alert.get('status', ''),
                alert.get('severity', ''),
                alert.get('timestamp', '')
            ])
        
        alert_table = Table(alert_data, colWidths=[2.5*inch, 1.2*inch, 1.2*inch, 1.6*inch])
        alert_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F59E0B')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F3F4F6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB'))
        ]))
        story.append(alert_table)
    
    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
